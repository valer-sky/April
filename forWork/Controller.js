"use strict";

"use strict";

function Controller() {
    let self = this,
        myModel = null,
        myView = null,
        startMoveX,  //переменные координат начала и конца движения для обмена местами шариков
        startMoveY,
        endMoveX,
        endMoveY,
        windowStartMoveX,  //переменные координат начала и конца движения для обработки свайпа
        windowEndMoveX;

    const SVGElem = document.getElementById("game");

    self.init = function (model, view) {
        myModel = model
        myView = view

        self.switchToStateFromURLHash();


        const startButton = document.getElementById('startButton'),
            rulesButton = document.getElementById('rulesButton'),
            soundOnOffButton = document.getElementById('soundOnOffButton'),
            tableHighScoreButton = document.getElementById('tableHighScoreButton'),
            closeButton = document.getElementById('close-button'),
            closeMessage = document.getElementById('close-message'),
            toggle = document.getElementById('mobile-menu-toggle');

            
        self.header = document.getElementById('header');

        window.addEventListener('resize', self.resize);     //изменение размера

        window.addEventListener('hashchange', self.switchToStateFromURLHash);   //изменение хэша урла

        window.addEventListener('beforeunload', self.beforeUnload);  //перезагрузка или закрытие страницы

        toggle.addEventListener('click', self.onMobileMenuClick);   //клик на мобильное меню

        startButton.addEventListener('click', self.start);                 //старт-кнопка
        startButton.addEventListener('tap', self.start, {passive: false});

        rulesButton.addEventListener('click', self.showRules);             //правила

        tableHighScoreButton.addEventListener('click', self.showHighScore);  //таблица рекордов

        soundOnOffButton.addEventListener('click', self.soundOnOff);             //кнопка музыки

        window.addEventListener('touchstart', self.windowTouchStart, {passive: false});    //обработка свайпа
        window.addEventListener('touchend', self.windowTouchEnd, {passive: false});

        window.addEventListener('touchmove', self.imgMove, {passive: false});

        closeButton.addEventListener('click', self.showMain);   //главная страница

        closeMessage.addEventListener('click', myView.hideMessageBox);  //кнопка "закрыть сообщение"
    }

    self.resize = function () {
        myModel.resize();
    }

    self.beforeUnload = function(EO) {
        EO = EO || window.event;

        myModel.beforeUnload(EO);
        EO.returnValue='Несохраненные данные будут утеряны'
    }

    self.onMobileMenuClick = function () {
        const header = self.header,
            method = header.classList.contains('is-visible') ? 'remove' : 'add';

        header.classList[method]('is-visible');
    }

    self.start = function () {
        myModel.start();
    }

    self.soundOnOff = function () {
        myModel.soundOnOff();
    }

    self.listenMoves = function () {
        SVGElem.addEventListener('mousedown', self.imgMouseDown, false);
        SVGElem.addEventListener('mouseup', self.imgMouseUp, false);

        SVGElem.addEventListener('touchstart', self.imgTouchStart, {passive: false});
        SVGElem.addEventListener('touchend', self.imgTouchEnd, {passive: false});
    }

    self.stopListenMoves = function () {
        SVGElem.removeEventListener('mousedown', self.imgMouseDown, true);
        SVGElem.removeEventListener('mouseup', self.imgMouseUp, true);

        SVGElem.removeEventListener('touchstart', self.imgTouchStart, {passive: false});
        SVGElem.removeEventListener('touchend', self.imgTouchEnd, {passive: false});
    }

    self.imgMouseDown = function (EO) {   //координаты начала и конца движения для обмена шариков
        EO = EO || window.event;

        startMoveX = EO.pageX;
        startMoveY = EO.pageY;
    }

    self.imgTouchStart = function (EO) {
        EO = EO || window.event;

        let touches = EO.changedTouches;
        startMoveX = touches[0].pageX;
        startMoveY = touches[0].pageY;
    }

    self.imgMouseUp = function (EO) {
        EO = EO || window.event;

        endMoveX = EO.pageX;
        endMoveY = EO.pageY;
        if ((Math.abs(endMoveX - startMoveX) > 10) ||  //движение должно быть более 10 пикселей
            (Math.abs(endMoveY - startMoveY) > 10)) {

            self.stopListenMoves();
            myModel.findElExchange(startMoveX, startMoveY, endMoveX, endMoveY);
        }
    }

    self.imgTouchEnd = function (EO) {
        EO = EO || window.event

        let touches = EO.changedTouches;
        endMoveX = touches[0].pageX;
        endMoveY = touches[0].pageY;
        if (((Math.abs(endMoveX - startMoveX) > 10) &&
            (Math.abs(endMoveX - startMoveX) < 200)) ||  //если движение более 10 и меньше 200 пикселей, то это чтобы передвигать шарики
            ((Math.abs(endMoveY - startMoveY) > 10) &&
                (Math.abs(endMoveY - startMoveY) < 200))) {
            myModel.findElExchange(startMoveX, startMoveY, endMoveX, endMoveY);
            self.stopListenMoves();
        }
    }

    self.windowTouchStart = function (EO) {       //обрабатываем свайп
        EO = EO || window.event

        let touches = EO.changedTouches;
        windowStartMoveX = touches[0].pageX;
    }

    self.windowTouchEnd = function (EO) {
        EO = EO || window.event

        let touches = EO.changedTouches;
        windowEndMoveX = touches[0].pageX;

        if ((Math.abs(windowEndMoveX - windowStartMoveX) > 200)) {
            if (Math.abs(windowEndMoveX - windowStartMoveX) > 200) {
                if (windowEndMoveX - windowStartMoveX > 0) {
                    self.showRules();
                } else {
                    self.showHighScore();
                }
            }
        }
    }

    self.imgMove = function (EO) {
        EO = EO || window.event
        EO.preventDefault();
    }

    self.switchToStateFromURLHash = function () {     //Переключение на УРЛ из Хэша
        let URLHash = window.location.hash,
            stateStr = URLHash.substr(1)    // убираем из закладки УРЛа решётку
        if (stateStr != "") { // если закладка непустая, читаем из неё состояние и отображаем
            myModel.spaState = {pagename: stateStr} // первая часть закладки - номер страницы
        } else {
            myModel.spaState = {pagename: ''}  // иначе показываем главную страницу
        }
        myModel.spaStateChanged();
    }

    self.switchToState = function (newState) {   //Изменение хэша страницы
        let stateStr = newState.pagename;
        location.hash = stateStr;
    }

    self.showRules = function () {                  //Переключение на страницы SPA
        self.switchToState({pagename: 'rules'});
    }

    self.showMain = function () {
        self.switchToState({pagename: ''});
    }

    self.showHighScore = function () {
        self.switchToState({pagename: 'highScore'});
    }
}