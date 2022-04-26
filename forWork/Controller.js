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

        // window.addEventListener('beforeunload', self.beforeUnload);  //перезагрузка или закрытие страницы

        

        rulesButton.addEventListener('click', self.showRules);             //правила

        tableHighScoreButton.addEventListener('click', self.showHighScore);  //таблица рекордов

        soundOnOffButton.addEventListener('click', self.soundOnOff);             //кнопка музыки

       

       

        closeButton.addEventListener('click', self.showMain);   //главная страница

        closeMessage.addEventListener('click', myView.hideMessageBox);  //кнопка "закрыть сообщение"
    }

    

    self.beforeUnload = function(EO) {
        EO = EO || window.event;

        myModel.beforeUnload(EO);
        EO.returnValue='Несохраненные данные будут утеряны'
    }

   

   
    self.soundOnOff = function () {
        myModel.soundOnOff();
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