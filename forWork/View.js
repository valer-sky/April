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

    let scoreNumber;   //счет

    let SVGElem = document.getElementById("game"),
        game = document.getElementsByClassName("game")[0],
        field = document.getElementsByClassName('container')[0],
        // buttons = document.getElementsByClassName('leftNav')[0],
        parallaxLayers = document.getElementsByClassName('parallaxLayer'),
        // backPictureMobile = document.getElementById('mobileBackground'),
        header = document.getElementById('header');

    let messages,         //таблица рекордов
        ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php",
        stringName = 'Lubochko_Xenia_Match3Game_tableHighScore',
        updatePassword; //пароль для блокировки записи другим человеком в таблицу рекордов


   

  

  

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
                
            } else {
                b = Math.round(Math.round(pageWidth / 100) * 0.75);
                field.style.flexDirection = 'column';
                
            }
        }

          // размер ячейки

        
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









