window.onhashchange = renderNewState;


function renderNewState() {
    const hash = window.location.hash;
    let state = decodeURIComponent(hash.substr(1));

    if(state === '') {
        state = {page : 'first'};
    } 
    // else {
    //     state = JSON.parse(state);

    // }

    let page = '';
    switch (state) {
        case "about":
            page += 'about';
            
            break;
            case "home":
            page += 'home';
            break;
            case "game":
            page += 'game';
            break;
    }

    document.getElementById('page').innerHTML = page;
}

function swithToState(state) {
    location.hash = encodeURIComponent(JSON.stringify(state));
}

function switcToFirst() {
    location.hash = JSON.stringify({page :'first'});
}
function switcToSecond() {
    location.hash = JSON.stringify({page :'second'});
}

function switcToThird() {
    location.hash = JSON.stringify({page :'third'});
}



renderNewState();

function View() {
    
    

    

    let messages,         //таблица рекордов
        ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php",
        stringName = 'Lubochko_Xenia_Match3Game_tableHighScore',
        updatePassword; //пароль для блокировки записи другим человеком в таблицу рекордов
    
        self.showPage = function (infoType) {                   //показать страницу с информацией
        let infoContainer = document.getElementById('info-container');
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

