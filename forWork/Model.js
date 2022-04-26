"use strict";

function Model() {
    let self = this,
        myView = null,
        myController = null;
        
        self.init = function (view, controller) {
        myView = view;
        myController = controller;

        self.checkSessionStorage();
    }

    self.soundOnOff = function () {
        myView.soundOnOff();
    }

    self.spaState = {}
    let flag = false;

    self.spaStateChanged = function () {       //изменение состояния в зависимости от хэша
        switch (self.spaState.pagename) {
            case 'rules':
                if (flag === 2 || flag === 1 || !flag) {
                    myView.showPage('rules');
                } else if (flag === 3) {
                    myView.hidePage();
                    setTimeout(timeOutRules, 500);
                }
                flag = 1
                break
            case '':
                if (flag === 1 || flag === 3) {
                    myView.hidePage();
                }
                flag = 2
                break
            case 'highScore':
                if (flag === 2 || flag === 3 || !flag) {
                    myView.showPage('highScore');
                } else if (flag === 1) {
                    myView.hidePage();
                    setTimeout(timeOutHighScore, 500);
                }
                flag = 3;
                break;
        }

        function timeOutRules() {
            myView.showPage('rules');
        }

        function timeOutHighScore() {
            myView.showPage('highScore');
        }
    }

    self.gameOver = function () {
        score = 0;
        emptyFlag = false;
        counterSteps = 0;
        matrix = [];
        collect = null;
        collectMove = null;
        sideMove = null;
        if (timer) {
            clearInterval(timer);
        }
        timer = 0;
        myView.updateScore(score);
        myView.updateSteps(counterSteps);

        myView.deleteField();
        saveModel = {'matrix': 0, 'score': 0, 'counterSteps': 0};

    }

    self.beforeUnload = function(EO) {  //сохраняем текущее состояние игры в sessionStorage
        EO = EO || window.event
        
        if( typeof matrix !== 'undefined' && score !== 0 && counterSteps !== 0){
            saveModel.matrix = matrix;
            saveModel.score = score;
            saveModel.counterSteps = counterSteps;
    
            let save = JSON.stringify(saveModel);
            window.sessionStorage.setItem('currentModelStateMatch3', save);
        }
        saveModel = {'matrix': 0, 'score': 0, 'counterSteps': 0}
        
    }

    self.checkSessionStorage = function() {     //восстановим состояние из sessionStorage
        let storageCheck = window.sessionStorage.getItem('currentModelStateMatch3')
        if(storageCheck) {
                let saveModel = JSON.parse(storageCheck);
                if( saveModel.matrix !== 0 ||
                    saveModel.score !== 0 ) {
                        matrix = saveModel.matrix;
                        score = saveModel.score;
                        counterSteps = saveModel.counterSteps;

                        emptyFlag = false;
                        collect = null;
                        collectMove = null;
                        sideMove = null;
                
                        
                        myView.deleteField();
                
                        cellWidthHeight = myView.buildScreen();  //расcчитать размеры элементов и поля
                
                        myView.updateScore(score);  //обновить шаги и счет
                        myView.updateSteps(counterSteps);
                
                        
                }
        saveModel = {'matrix': 0, 'score': 0, 'counterSteps': 0}
        let save = JSON.stringify(saveModel);
        window.sessionStorage.setItem('currentModelStateMatch3', save);
        };
    }
}