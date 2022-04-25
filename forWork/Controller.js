"use strict";

function Controller() {
    

    
    let self = this;

        const startButton = document.getElementById('startButton'),
            rulesButton = document.getElementById('rulesButton'),
           
            tableHighScoreButton = document.getElementById('tableHighScoreButton'),
            closeButton = document.getElementById('close-button'),
            closeMessage = document.getElementById('close-message');
            

            
        

           //изменение размера

        window.addEventListener('hashchange', self.switchToStateFromURLHash);   //изменение хэша урла

        window.addEventListener('beforeunload', self.beforeUnload);  //перезагрузка или закрытие страницы

       

      
        startButton.addEventListener('tap', self.start, {passive: false});

        rulesButton.addEventListener('click', self.showRules);             //правила

        tableHighScoreButton.addEventListener('click', self.showHighScore);  //таблица рекордов

             //кнопка музыки

       

        
        closeButton.addEventListener('click', self.showMain);   //главная страница

        // closeMessage.addEventListener('click', myView.hideMessageBox);  //кнопка "закрыть сообщение"
    }

    self.resize = function () {
        myModel.resize();
    }

    self.beforeUnload = function(EO) {
        EO = EO || window.event;

        myModel.beforeUnload(EO);
        EO.returnValue='Несохраненные данные будут утеряны'
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
