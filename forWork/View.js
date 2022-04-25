"use strict";

"use strict";

function View() {
    let self = this,
        myModel = null;

    let cellWidthHeight,  //размер ячейки
        b,          //коэффициент, для расчета размера ячейки от размера экрана

        clickAudio, //звук при ударе
        backAudio;   //фоновая музыка

    let checker = document.getElementById('soundOnOffButton'), //пункт меню вкл/выкл звук
        checkerText,
        scorePlate = document.getElementById('counter'),    //счет
        stepsPlate = document.getElementById('counterStep');  //шаги

    let columns = 8, // количество колонок и столбцов в поле
        rows = 8,
        speedExch,  //скорость обмена
        speedFall,   //скорость падения
        scoreNumber;   //счет

    let SVGElem = document.getElementById("game"),
        game = document.getElementsByClassName("game")[0],
        field = document.getElementsByClassName('container')[0],
        buttons = document.getElementsByClassName('leftNav')[0],
        parallaxLayers = document.getElementsByClassName('parallaxLayer'),
        backPictureMobile = document.getElementById('mobileBackground'),
        header = document.getElementById('header');

    let messages,         //таблица рекордов
        ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php",
        stringName = 'Lubochko_Xenia_Match3Game_tableHighScore',
        updatePassword; //пароль для блокировки записи другим человеком в таблицу рекордов


    class Element {            //кружок
        constructor() {
            this.row = null;         //адрес элемента в матрице
            this.column = null;
            this.posX = null;
            this.posY = null;
            this.transY = 0;
            this.transX = 0;
        }

        move() {   //ф-я переезда эл-та на новое место
            let elPiece = document.getElementById(this.row + '' + this.column);
            if (elPiece !== null) {
                elPiece.setAttribute('transform', "translate(" + this.transX + "," + this.transY + ")");
            }
        }

        reset() {
            this.posX = null;
            this.posY = null;
            this.transX = 0;
            this.transY = 0;
        }
    }

    self.getTransform = function (myElement) {
        var xforms = myElement.getAttribute('transform');
        var parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(xforms);
        return {
            x: Number(parts[1]),
            y: Number(parts[2])
        }
    }

    let firstEl = new Element(),
        secondEl = new Element();

    self.start = function (model) {
        myModel = model;
        self.buildScreen();
    }

    function getWindowClientSize() {                  //узнать размер окна
        let uaB = navigator.userAgent.toLowerCase(),
            isOperaB = (uaB.indexOf('opera') > -1),
            isIEB = (!isOperaB && uaB.indexOf('msie') > -1);

        let clientWidth = ((document.compatMode || isIEB) && !isOperaB) ?
            (document.compatMode == 'CSS1Compat') ?
                document.documentElement.clientWidth :
                document.body.clientWidth :
            (document.parentWindow || document.defaultView).innerWidth;

        let clientHeight = ((document.compatMode || isIEB) && !isOperaB) ?
            (document.compatMode == 'CSS1Compat') ?
                document.documentElement.clientHeight :
                document.body.clientHeight :
            (document.parentWindow || document.defaultView).innerHeight

        return {width: clientWidth, height: clientHeight}
    }

    self.buildScreen = function () {              //функция перестройки экрана в зависимости от устройства, размера и ориентации экрана
        let pageWidth = getWindowClientSize().width,
            pageHeight = getWindowClientSize().height;

        const devices = new RegExp('Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini', "i");

        if (devices.test(navigator.userAgent)) {//мобильник или планшет
            header.classList.remove('is-desktop');
            for (let layer of parallaxLayers) {   //выкл параллакс
                layer.style.display = 'none';
            }
            backPictureMobile.style.display = 'block';

            if (pageWidth > pageHeight) {
                field.style.flexDirection = 'row';
                buttons.style.flexDirection = 'column';
                if ((pageWidth / pageHeight < 1.2 &&
                    pageWidth / pageHeight > 1) ||
                    (pageHeight / pageWidth < 1.1 &&
                        pageHeight / pageWidth > 1)) {
                    b = Math.round(Math.round(pageHeight / 100) * 0.75);
                } else {
                    b = Math.round(Math.round(pageHeight / 100) * 0.95);
                }
            } else {
                field.style.flexDirection = 'column';
                buttons.style.flexDirection = 'row';
                if ((pageWidth / pageHeight < 1.35 &&
                    pageWidth / pageHeight > 1) ||
                    (pageHeight / pageWidth < 1.35 &&
                        pageHeight / pageWidth > 1)) {
                    b = Math.round(Math.round(pageWidth / 100) * 0.75);
                } else {
                    b = Math.round(Math.round(pageWidth / 100) * 0.95);
                }
            }
        } else {                                 //ПК
            header.classList.add('is-desktop');
            if (pageWidth > pageHeight) {
                b = Math.round(Math.round(pageHeight / 100) * 0.75);
                field.style.flexDirection = 'row';
                buttons.style.flexDirection = 'column';
            } else {
                b = Math.round(Math.round(pageWidth / 100) * 0.75);
                field.style.flexDirection = 'column';
                buttons.style.flexDirection = 'row';
            }
        }

        cellWidthHeight = b * 10;   // размер ячейки

        speedExch = cellWidthHeight / 10;   //скорость обмена
        speedFall = cellWidthHeight / 10;  // скорость падения

        game.style.width = rows * cellWidthHeight + 'px';  //размеры игры
        game.style.height = columns * cellWidthHeight + 'px';

        SVGElem.setAttribute("width", rows * cellWidthHeight);
        SVGElem.setAttribute("height", columns * cellWidthHeight);

        return cellWidthHeight
    }

    self.resizeField = function (cellWidthHeight) {            // изменить размер всех элементов на поле
        let elements = document.querySelectorAll("#game circle")
        for (var i = 0; i < elements.length; i++) {
            let id = elements[i].getAttribute('id'),
                row = id[1],
                column = id[0];

            elements[i].setAttribute("cx", row * cellWidthHeight + cellWidthHeight / 2);
            elements[i].setAttribute("cy", column * cellWidthHeight + cellWidthHeight / 2);
            elements[i].setAttribute('r', 0.9 * cellWidthHeight / 2);
        }
    }

    self.deleteField = function () {                   //удалить все элементы на поле
        let elements = document.querySelectorAll("#game circle");
        for (var i = 0; i < elements.length; i++) {
            elements[i].remove();
        }
        return elements
    }

    self.music = function () {
        clickAudio = new Audio("music/dzin.mp3");
        backAudio = new Audio("music/background.mp3");
    }
    self.music()

    self.updateScore = function (count) {       //обновить счет
        scoreNumber = count;
        scorePlate.innerHTML = count;
    }

    self.updateSteps = function (counterSteps) {       //обновить шаги
        stepsPlate.innerHTML = counterSteps;
    }

    self.drawElem = function (x, y, color) {     //рисует на поле элемент в опр. координатах и цвета
        let elem = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        elem.setAttribute("cx", x + cellWidthHeight / 2);
        elem.setAttribute("cy", y + cellWidthHeight / 2);
        elem.setAttribute("r", 0.9 * cellWidthHeight / 2);
        elem.setAttribute("fill", color);

        elem.setAttribute('id', y / cellWidthHeight + '' + x / cellWidthHeight); //двузначное число, где первая цифра -номер ряда, вторая цифра - номер колонки
        SVGElem.appendChild(elem);
        elem.setAttribute('transform', 'translate(0,0)');
    }

    self.deleteGroup = function (collect) {//  удалить ряд одинаковых элементов
        for (let i = 0; i < collect.length; i++) {
            if (collect[i] !== null) {
                let id = collect[i][0] + '' + collect[i][1],
                    element = document.getElementById(id);
                if (element !== null) {
                    element.remove();
                }
            }
        }
        return collect
    }

    self.soundOnOff = function () {           //вкл/выкл звук
        checkerText = checker.textContent;
        if (checkerText === 'Включить звук') {
            checker.textContent = 'Выключить звук';
            backAudio.currentTime = 0;
            backAudio.play();
        } else if (checkerText === 'Выключить звук') {
            checker.textContent = 'Включить звук';
            backAudio.pause();
        }
    }

    self.clickSound = function () {    //вкл звук при ударе эл-тов
        clickAudio.play();
    }

    self.fallAnimationTick = function (collectMove) {  //движение группы блоков вниз
        for (let i = 0; i < collectMove.length; i++) {
            let id = collectMove[i],
                elPiece = document.getElementById(id),
                trans = self.getTransform(elPiece),
                el = new Element;

            el.row = id[0];
            el.column = id[1];

            el.transX = trans.x;
            el.transY = trans.y + speedFall;

            el.posY = parseInt(elPiece.getAttribute('cy')) + el.transY;

            if (el.posY > ((parseInt(el.row) + 1) * cellWidthHeight + cellWidthHeight / 2)) {
                for (let i = 0; i < collectMove.length; i++) {
                    let id = collectMove[i],
                        elPiece = document.getElementById(id);
                    elPiece.setAttribute('id', (parseInt(id[0]) + 1) + '' + id[1]);  //меняем id упавших на 1 уровень элементов
                }
                myModel.stopFall(); //в модель, что анимация закончена
                return false
            }
            el.move();
        }
    }

    self.exchangeAnimationTick = function (first, second, sideMove) {   //обмен местами элементов
        firstEl.row = first['row'];
        secondEl.row = second['row'];
        firstEl.column = first['column'];
        secondEl.column = second['column'];

        let firstElPiece = document.getElementById(firstEl.row + '' + firstEl.column),
            secondElPiece = document.getElementById(secondEl.row + '' + secondEl.column),
            id1 = firstEl.row + '' + firstEl.column,
            id2 = secondEl.row + '' + secondEl.column,
            trans1 = self.getTransform(firstElPiece),
            trans2 = self.getTransform(secondElPiece);

        if (sideMove === 'left') {
            firstEl.transX = trans1.x - speedExch;
            secondEl.transX = trans2.x + speedExch;
            firstEl.posX -= speedExch;

            if (firstEl.posX < -cellWidthHeight) {
                delEl();
                return
            }
        } else if (sideMove === 'right') {
            firstEl.transX = trans1.x + speedExch;
            secondEl.transX = trans2.x - speedExch;
            firstEl.posX += speedExch;

            if (firstEl.posX > cellWidthHeight) {
                delEl();
                return
            }
        } else if (sideMove === 'bottom') {
            firstEl.transY = trans1.y + speedExch;
            secondEl.transY = trans2.y - speedExch;
            firstEl.posY += speedExch;

            if (firstEl.posY > cellWidthHeight) {
                delEl();
                return
            }
        } else if (sideMove === 'top') {
            firstEl.transY = trans1.y - speedExch;
            secondEl.transY = trans2.y + speedExch;
            firstEl.posY -= speedExch;

            if (firstEl.posY < -cellWidthHeight) {
                delEl();
                return
            }
        }
        firstEl.move();
        secondEl.move();

        function delEl() {      //обмен закончен
            self.clickSound();
            firstEl.reset();
            secondEl.reset();

            firstElPiece.setAttribute('id', id2); //меняем id элементов
            secondElPiece.setAttribute('id', id1);

            myModel.stopExchange();
            return
        }
    }

    self.showPage = function (infoType) {                   //показать страницу с информацией
        let infoContainer = document.getElementById('info-container')
        fillWithContent();

        function fillWithContent() {
            switch (infoType) {         //в зависимости от нажатой кнопки, будем менять содержимое
                case 'rules':            //правила игры
                    let infoContent = document.getElementById('info-content');
                    infoContent.innerHTML = `<ol>
                                                    <li>Ищи совпадающие по цвету элементы по горизонтали, вертикали или диагонали (3 и более)</li><br>
                                                    <li>Элементами можно управлять при помощи мыши на ПК и пальцем на тачскрине</li><br>
                                                    <li>Нажми на элемент и проведи в сторону второго элемента, с которым необходимо поменяться местами</li><br>
                                                    <li>Одинаковые группы исчезнут и поле перестоится, а ты получишь очки</li><br>
                                                    <li>Набери максимальное количество очков за 30 ходов</li>
                                                </ol>`;
                    infoContainer.style.animationName = 'info-show';
                    break
                case 'highScore':         //таблица рекордов
                    uploadTableHighScore();
                    break
            }

            function uploadTableHighScore() {   //читаем таблицу рекордов с сервера
                $.ajax({
                        url: ajaxHandlerScript,
                        type: 'POST', dataType: 'json',
                        data: {f: 'READ', n: stringName},
                        cache: false,
                        success: readReady,
                        error: errorHandler
                    }
                )
            }

            function readReady(callresult) {          //таблица загружена и готова к показу
                if (callresult.error != undefined)
                    alert(callresult.error);
                else {
                    messages = JSON.parse(callresult.result);
                    showHighScore(messages);
                    infoContainer.style.animationName = 'info-show';
                }
            }

            function showHighScore(messages) {      // показывает таблицу рекордов
                var str = '',
                    infoContent = document.getElementById('info-content');

                str += '<ol>';
                for (let m = 0; m < messages.length; m++) {
                    let message = messages[m];
                    str += "<li>" + message.name + ":  " + message.score + "<li /><br>";
                }
                str += '</ol>';
                infoContent.innerHTML = str;
            }

            function errorHandler(statusStr, errorStr) {
                alert(statusStr + ' ' + errorStr);
            }

        }
    }

    self.hidePage = function () {                     //спрятать страницу с информацией
        if (document.getElementById('info-container')) {
            let infoContainer = document.getElementById('info-container');
            infoContainer.style.animationName = 'info-hide';
        }
    }

    self.updateTableHighScore = function () {     //в конце игры если надо обновляем таблицу рекордов

        function readHighScoreTable() {     //получаем данные о рекордах с сервера
            updatePassword = Math.random();
            $.ajax({
                    url: ajaxHandlerScript,
                    type: 'POST', dataType: 'json',
                    data: {
                        f: 'LOCKGET', n: stringName,
                        p: updatePassword
                    },
                    cache: false,
                    success: lockGetReady,
                    error: errorHandler
                }
            )
        }

        function lockGetReady(callresult) {  // добавляем новое значение, если оно больше рекорда
            if (callresult.error !== undefined) {
                alert(callresult.error);
            } else {
                messages = JSON.parse(callresult.result);
                if (readLast(messages)) {       //проверим, является ли текущее значение очков рекордом, и если да, запишем его в таблицу
                    showWriteYourNameWindow();   //предлагаем игроку ввести имя

                    function showWriteYourNameWindow() {   //окошко запрашивает имя игрока
                        let message = `Поздравляем, вы установили новый рекорд -  ` + scoreNumber + `  очков за 30 ходов!<br> <br>Введите ваше имя:
                                       <input type='text' id='myName'><br />`;
                        self.showMessageBox(message);
                    }
                } else {
                    self.showMessageBox('Конец игры. <br> Вам не удалось поставить рекорд');
                    myModel.gameOver();
                }
            }
        }

        function readLast(messages) {                //сравниваем текущий счет с минимальным рекордом
            let lastHighScore = messages[messages.length - 1],
                scoreLastHighScore = lastHighScore.score;
            if (scoreNumber > scoreLastHighScore ||   //если текущее значение больше текущего минимального рекорда
                messages.length < 10) {      //или рекордов меньше 10
                return true        //запишем его в таблицу
            }
            return false
        }

        function errorHandler(statusStr, errorStr) {  //ошибка сохранения
            alert(statusStr + ' ' + errorStr);
        }

        readHighScoreTable();
    }

    self.pushMessageToTableHighscore = function (nickname) {
        messages.push({'name': nickname, 'score': scoreNumber});

        function compare(a, b) {       //сортируем значения от большего к меньшему по величине очков
            return b.score - a.score
        }

        messages.sort(compare);

        if (messages.length > 10) {
            messages = messages.slice(0, 10);   //сохраняем первые 10 значений
        }
        $.ajax({               //перезаписываем таблицу на сервере
                url: ajaxHandlerScript,
                type: 'POST', dataType: 'json',
                data: {
                    f: 'UPDATE', n: stringName,
                    v: JSON.stringify(messages), p: updatePassword
                },
                cache: false,
                success: updateReady,
                error: errorHandler
            }
        )
        myModel.gameOver();
    }

    function updateReady(callresult) {     // новая таблица рекордов сохранена на сервере
        if (callresult.error != undefined)
            alert(callresult.error);
    }

    function errorHandler(statusStr, errorStr) {  //ошибка сохранения
        alert(statusStr + ' ' + errorStr);
        myModel.gameOver();
    }

    self.showMessageBox = function (messageInnerHtml) {            //показывает  сообщение
        let messageContainer = document.getElementById('message-container');
        fillWithContent();
        messageContainer.style.animationName = 'message-show';

        function fillWithContent() {
            let messageContent = document.getElementById('message-content');
            messageContent.innerHTML = messageInnerHtml;
        }
    }

    self.hideMessageBox = function () {   //прячет сообщение
        if (document.getElementById('message-container')) {
            let messageContainer = document.getElementById('message-container');
            messageContainer.style.animationName = 'message-hide';
        }
    }
}







