"use strict";

function Model() {
    let self = this,
        myView = null,
        myController = null,
        saveModel = {'matrix': 0, 'score': 0, 'counterSteps': 0},

        a,  //совпадающие ячейки (промежуточная переменная)

        matrix = [],         //матрица поля, в которой будем хранить актуальную инфу по цветам
        colors = [    //возможные цвета шариков
            '#490A3C',
            '#BD1F52',
            '#E88024',
            '#F8CB10',
            '#a1c5d0',
            '#19b3b4',
            '#FF9F99'
        ],
        score = 0,
        emptyFlag = false, //на поле есть пустые клетки
        collect = null, //координаты удаленных элементов 
        collectMove = null, // массив эл-тов, которые нужно двигать вниз
        collectMinus,       //пустоты, которые не схлопнулись после текущего опуска
        collectBottom,   //нижние пустые элементы
        deleted,

        sideMove,   //в какую сторону был жест для обмена
        timer = 0,
        cellWidthHeight   //размер ячейки

    let firstEl = {    //координаты элементов для обмена
            row: null,
            column: null
        },
        secondEl = {
            row: null,
            column: null
        },
        flagExchangeBack,   //флаг, если нужно обменять элементы назад
        counterSteps = 0;

    const columns = 8, // количество колонок и столбцов в поле
        rows = 8;

    let game = document.getElementById("game"),
        circles = document.getElementsByTagName('circle');

    self.getTransform = function (myElement) {
        var xforms = myElement.getAttribute('transform');
        var parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(xforms);
        return {
            x: Number(parts[1]),
            y: Number(parts[2])
        }
    }

    self.resize = function () {    //запускаем функцию изменения размера
        cellWidthHeight = myView.buildScreen();  //пересчитываем размеры
        myView.resizeField(cellWidthHeight);    //изменяем размеры эл-тов
    }

    self.createEmpty = function () {                   //создание пустой матрицы игрового поля
        let matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix.push([]);
            for (let j = 0; j < columns; j++) {
                matrix[i].push(null);
            }
        }
        return matrix
    }

    self.fillIn = function (matrix, property, k = rows) {    //заполняем пустые клетки матрицы рандомными цветами
        for (let i = 0; i < k; i++) {
            for (let j = 0; j < columns; j++) {
                if (matrix[i][j] === null) {
                    matrix[i][j] = property[randomDiap(0, (property.length - 1))];
                    let x = j * cellWidthHeight,
                        y = i * cellWidthHeight;
                    myView.drawElem(x, y, matrix[i][j]); //рисуем элементы
                }
            }
        }
        return matrix
    }

    self.fillInFromMatrix = function (matrix) {   //заполнить поле элементами из матрицы
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                let x = j * cellWidthHeight,
                    y = i * cellWidthHeight;
                myView.drawElem(x, y, matrix[i][j]); //рисуем элементы
            }
        }
    }

    function randomDiap(n, m) {   // ф-я генерирует случайное число от n до m
        return Math.floor(
            Math.random() * (m - n + 1)
        ) + n
    }

    self.init = function (view, controller) {
        myView = view;
        myController = controller;

        self.checkSessionStorage();
    }

    self.findSameColor = function (matrix) {      //находим координаты строки одинаковых эл-тов
        if (emptyFlag === false) {
            let sameColorEl = [],
                sameColor = [];

            for (let i = rows - 1; i >= 0; i--) {           //находим одинаковые ряды
                sameColorEl = [];
                for (let j = columns - 1; j > 1; j--) {
                    if ((matrix[i][j] === matrix[i][j - 1]) &&
                        (matrix[i][j] === matrix[i][j - 2]) &&
                        (matrix[i][j] !== null)) {
                        sameColorEl.push(i + '' + j, i + '' + (j - 1), i + '' + (j - 2));

                        for (let k = 3; k < j + 1; k++) {           //если больше трех одинаковых эл-тов в ряд
                            if (matrix[i][j] === matrix[i][j - k]) {
                                sameColorEl.push(i + '' + (j - k));
                            } else {
                                j = j + 1 - k;
                                break
                            }
                        }
                        sameColor = sameColor.concat(sameColorEl)        //номер ряда, номер столбеца
                    } else {
                        continue
                    }
                }
            }
            for (let i = rows - 1; i > 1; i--) {           //находим одинаковые столбцы
                for (let j = columns - 1; j >= 0; j--) {
                    if ((matrix[i][j] === matrix[i - 1][j]) &&
                        (matrix[i - 2][j] === matrix[i][j]) &&
                        (matrix[i][j] !== null)) {
                        sameColorEl.push(i + '' + j, (i - 1) + '' + j, (i - 2) + '' + j);

                        for (let k = 3; k < i + 1; k++) {           //если больше трех одинаковых эл-тов в ряд
                            if (matrix[i][j] === matrix[i - k][j]) {
                                sameColor.push((i - k) + '' + j);
                            } else {
                                break
                            }
                        }
                        sameColor = sameColor.concat(sameColorEl)    //номер ряда, номер столбеца
                    } else {
                        continue
                    }
                }
            }
            for (let i = rows - 1; i > 1; i--) {           //диагонали низ+право --- верх+лево
                for (let j = columns - 1; j > 1; j--) {
                    if ((matrix[i][j] === matrix[i - 1][j - 1]) &&
                        (matrix[i - 2][j - 2] === matrix[i][j]) &&
                        (matrix[i][j] !== null)) {
                        sameColorEl.push(i + '' + j, (i - 1) + '' + (j - 1), (i - 2) + '' + (j - 2));
                        for (let k = 3; k < i + 1; k++) {
                            if (matrix[i][j] === matrix[i - k][j - k]) {
                                sameColor.push((i - k) + '' + (j - k));
                            } else {
                                break
                            }
                        }
                        sameColor = sameColor.concat(sameColorEl)    //номер ряда, номер столбеца
                    } else {
                        continue
                    }
                }
            }
            for (let i = rows - 1; i > 1; i--) {           //диагонали низ+лево --- верх+право
                for (let j = 0; j < columns - 2; j++) {
                    if ((matrix[i][j] === matrix[i - 1][j + 1]) &&
                        (matrix[i - 2][j + 2] === matrix[i][j]) &&
                        (matrix[i][j] !== null)) {
                        sameColorEl.push(i + '' + j, (i - 1) + '' + (j + 1), (i - 2) + '' + (j + 2));
                        for (let k = 3; k < i + 1; k++) {
                            if (matrix[i][j] === matrix[i - k][j + k]) {
                                sameColor.push((i - k) + '' + (j + k));
                            } else {
                                break
                            }
                        }
                        sameColor = sameColor.concat(sameColorEl);   //номер ряда, номер столбеца
                    } else {
                        continue
                    }
                }
            }
            let sameColorSet = new Set(sameColor)  //преобразуем в сет, чтобы удалить повторы
            if (sameColor.length === 0) {  // если возвращается пустой сет, то у него нет длины, а нам нужна длина
                return []
            } else {
                return [...sameColorSet] //массив ячеек, которые не схлопываются в этот прием
            }

        } else return []
    }

    self.findCollectBottom = function (matrix) {   //находим первые снизу удаленные эл-ты
        let collectBottom = []
        for (let j = columns - 1; j >= 0; j--) {    //идем по столбцам от последнего к первому снизу вверх
            for (let i = rows - 1; i >= 0; i--) {
                if (matrix[i][j] === null) {

                    collectBottom.push(i + '' + j);
                    break
                }
            }
        }
        return collectBottom
    }

    self.findCollectMinus = function (collect, collectBottom) {  //находим пустоты, которые не схлопнутся в этот заход
        let collectMinus;
        collectMinus = collect.filter(el => !collectBottom.includes(el));      //collectMinus = collect - collectBottom
        let collectMinusSet = new Set(collectMinus);  //преобразуем в сет, чтобы удалить повторы

        return [...collectMinusSet]     //массив ячеек, которые не схлопываются в этот прием
    }

    self.findCollectMove = function (collectBottom, collectMinus) {   //ищем элементы, которые будут падать
        let arrayMove = [],
            row,
            column;
        for (let k = 0; k < collectBottom.length; k++) {
            row = collectBottom[k][0];
            column = collectBottom[k][1];
            for (let i = row - 1; i >= 0; i--) {
                arrayMove.push(i + '' + column);   //добавляем в массив id эл-тов, которые будут падать
            }
        }
        //удаляем из этого массива пустые эл-ты
        for (let value of collectMinus) {
            if (arrayMove.includes(value)) {
                let index = arrayMove.indexOf(value);
                arrayMove.splice(index, 1);
            }
        }
        return arrayMove
    }

    self.changeColorsAfterExchange = function (firstEl, secondEl) {     //меняем цвета в матрице у обмениваемых эл-тов
        let color //промежуточная переменная для обмена цветами
        color = matrix[parseInt(firstEl.row)][parseInt(firstEl.column)];
        matrix[parseInt(firstEl.row)][parseInt(firstEl.column)] = matrix[parseInt(secondEl.row)][parseInt(secondEl.column)];
        matrix[parseInt(secondEl.row)][parseInt(secondEl.column)] = color;
    }

    self.markNullsDeleted = function (collect, matrix, minus = 0) {  //вносим в матрицу нули из collect
        for (let k = 0; k < collect.length; k++) {
            let row = parseInt(collect[k][0]) + minus,
                column = collect[k][1];

            matrix[row][column] = null;
        }
        return collect
    }

    self.markNullsTop = function (collectBottom, matrix) { //пометим в первом ряду матрицы удаленные элементы нулями
        for (let i = 0; i < collectBottom.length; i++) {
            let column = collectBottom[i][1]
            matrix[0][column] = null
        }
        return matrix
    }

    self.changeMatrixAfterFall = function () { //обновляем информацию о цвете в матрице состояния
        let matrixNew = self.createEmpty(),
            elements = document.getElementsByTagName('circle');

        for (let elem of elements) {
            let color = elem.getAttribute('fill'),
                id = elem.getAttribute('id'),
                row = parseInt(id[0]),
                column = parseInt(id[1]);
            matrixNew[row][column] = color;
        }
        return matrixNew
    }

    self.findElExchange = function (startMoveX, startMoveY, endMoveX, endMoveY) {

        function findFirstElDir() {  //находим первый эл-т и направление движения мыши

            firstEl['row'] = Math.floor((startMoveY - game.getBoundingClientRect().top) / cellWidthHeight);
            firstEl['column'] = Math.floor((startMoveX - game.getBoundingClientRect().left) / cellWidthHeight);

            if ((Math.abs(endMoveX - startMoveX) > Math.abs(endMoveY - startMoveY))) {      //горизонтальное движение
                if (endMoveX > startMoveX) {
                    sideMove = 'right';
                } else {
                    sideMove = 'left';
                }
            } else if ((Math.abs(endMoveX - startMoveX) < Math.abs(endMoveY - startMoveY))) {      //вертикальное движение
                if (endMoveY > startMoveY) {
                    sideMove = 'bottom';
                } else {
                    sideMove = 'top';
                }
            }
        }

        function findSecondEl(fEl, sMove) {   // находим второй элемент
            if (sMove === 'right') {
                secondEl.row = fEl.row;
                secondEl.column = parseInt(fEl.column) + 1;
            } else if (sMove === 'bottom') {
                secondEl.row = parseInt(fEl.row) + 1;
                secondEl.column = fEl.column;
            } else if (sMove === 'left') {
                secondEl.row = fEl.row;
                secondEl.column = parseInt(fEl.column) - 1;
            } else if (sMove === 'top') {
                secondEl.row = parseInt(fEl.row) - 1;
                secondEl.column = fEl.column;
            }
            return secondEl
        }

        findFirstElDir()
        secondEl = findSecondEl(firstEl, sideMove);

        flagExchangeBack = false;
        timer = setInterval(animateExchange, 1000 / 60);  //анимация обмена элементов

        function animateExchange() {
            myView.exchangeAnimationTick(firstEl, secondEl, sideMove);
        }
    }

    self.scoreCounter = function (len) {   //количество очков равно количеству удаленных элементов
        score += len;
    }

    self.start = function () {    // начало игры
        emptyFlag = false;
        matrix = [];
        collect = null;
        collectMove = null;
        sideMove = null;

        score = 0;
        counterSteps = 0;

        if (timer) {
            clearInterval(timer);
        }
        timer = 0;
        myView.deleteField();

        cellWidthHeight = myView.buildScreen();  //расчитать размеры элементов и поля
        matrix = self.createEmpty();  //создать пустую матрицу

        myView.updateScore(score);  //обновить шаги и счет
        myView.updateSteps(counterSteps);

        self.fillIn(matrix, colors);   //заполним поле элементами
        self.firstCircle(matrix); //запускаем игровой цикл
    }

    self.firstCircle = function (matrix) {   //основной цикл программы
        self.fillIn(matrix, colors, 1);      //заполнить пустые ячейки в первом ряду матрицы и нарисовать их во View
        a = self.findSameColor(matrix); //поиск совпадающих ячеек
        if (a.length !== 0) {         // если такие есть
            collect = myView.deleteGroup(a, emptyFlag); // удалить совпадения
            emptyFlag = true;
            deleted = self.markNullsDeleted(collect, matrix); //заполнить null удаленные эл-ты в матрице

            self.scoreCounter(collect.length);
            myView.updateScore(score);

            self.moveDown();
        } else {
            emptyFlag = false
            myController.listenMoves(); //слушаем движения пользователя
        }
    }

    self.moveDown = function () {        //функция падения
        collectBottom = self.findCollectBottom(matrix); //нижние из группы удаленных элементов
        collectMinus = self.findCollectMinus(deleted, collectBottom);  //находим эл-ты, которые не схлопнутся в эту итерацию
        collectMove = self.findCollectMove(collectBottom, collectMinus);   //находим область, которую будем двигать вниз на 1 шаг

        if ((collectMove === null || collectMove.length === 0) &&
            collectMinus.length > 0) {
            self.markNullsTop(collectBottom, matrix);  //пометить в матрице верхние пустые нулями

            matrix = self.fillIn(matrix, colors, 1); // заполняем пустые ячейки в первом ряду элементами
            deleted = self.findNulls(matrix);   //находим незаполненные за предыдущие опуски пустоты в матрице
            if (deleted.length === 0) {
                myView.clickSound();
            }

            self.moveDown()  //падаем дальше
        } else if (collectMove === null || collectMove.length === 0) {   //если таких нет
            self.markNullsTop(collectBottom, matrix);  //пометить в матрице верхние пустые нулями
            self.firstCircle(matrix);
        } else {
            timer = setInterval(animateFall, 1000 / 60);

            function animateFall() {               //анимация падения
                myView.fallAnimationTick(collectMove, emptyFlag);
            }
        }
    }

    self.stopFall = function () {   //остановить падение уровня
        emptyFlag = false;
        clearInterval(timer);  //остановим таймер
        timer = 0;

        matrix = self.changeMatrixAfterFall();  //обновляем матрицу

        for (let circle of circles) {      //устанавливаем все координаты абсолютные без transform
            let coordX = parseInt(circle.getAttribute('cx')),
                coordY = parseInt(circle.getAttribute('cy')),
                translX = parseInt(self.getTransform(circle).x),
                translY = parseInt(self.getTransform(circle).y);

            circle.setAttribute('cx', coordX + translX);
            circle.setAttribute('cy', coordY + translY);

            circle.setAttribute('transform', 'translate(0,0)')
        }

        matrix = self.fillIn(matrix, colors, 1) // заполняем пустые ячейки в первом ряду элементами
        deleted = self.findNulls(matrix)   //находим незаполненные за предыдущие опуски пустоты в матрице
        if (deleted.length === 0) {
            myView.clickSound();
        }

        collect = null;
        collectMove = null;
        self.moveDown();   //падаем дальше
        return false
    }

    self.findNulls = function (matrix) {  //находим пустоты в матрице, на которые нужно продолжать опускать элементы
        let nulls = []
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (matrix[i][j] === null) {
                    nulls.push(i + '' + j);
                }
            }
        }
        return nulls
    }

    self.stopExchange = function () {   //остановить обмен элементов
        self.changeColorsAfterExchange(firstEl, secondEl); //обновить цвета в матрице
        clearInterval(timer);
        timer = 0;

        a = self.findSameColor(matrix); //поиск совпадающих строк
        if (a.length !== 0) {           //если такие есть
            counterSteps += 1;
            myView.updateSteps(counterSteps);
            if (counterSteps === 30) {
                myView.updateTableHighScore(score);   //обновляем таблицу рекордов, если надо
            }

            firstEl.row = null;
            firstEl.column = null;
            secondEl.row = null;
            secondEl.column = null;

            collect = myView.deleteGroup(a, emptyFlag); // удалить совпадения
            emptyFlag = true;
            deleted = self.markNullsDeleted(collect, matrix); //заполнить null удаленные эл-ты в матрице

            self.scoreCounter(collect.length);     //обновить счет
            myView.updateScore(score);

            self.moveDown();
        } else {         //если совпадений нет, вернуть элементы назад
            if (flagExchangeBack === true) {
                firstEl.row = null;
                firstEl.column = null;
                secondEl.row = null;
                secondEl.column = null;
                flagExchangeBack = false;
                self.firstCircle(matrix);
            } else {
                flagExchangeBack = true;
                timer = setInterval(animateExchange, 1000 / 60);

                function animateExchange() {
                    myView.exchangeAnimationTick(firstEl, secondEl, sideMove);
                }
            }
        }
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
                flag = 3
                break
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
                let saveModel = JSON.parse(storageCheck)
                if( saveModel.matrix !== 0 ||
                    saveModel.score !== 0 ) {
                        matrix = saveModel.matrix;
                        score = saveModel.score;
                        counterSteps = saveModel.counterSteps;

                        emptyFlag = false;
                        collect = null;
                        collectMove = null;
                        sideMove = null;
                
                        if (timer) {
                            clearInterval(timer);
                        }
                        timer = 0;
                        myView.deleteField();
                
                        cellWidthHeight = myView.buildScreen();  //расcчитать размеры элементов и поля
                
                        myView.updateScore(score);  //обновить шаги и счет
                        myView.updateSteps(counterSteps);
                
                        self.fillInFromMatrix(matrix);   //заполним поле элементами
                        self.firstCircle(matrix); //запускаем игровой цикл
                }
        saveModel = {'matrix': 0, 'score': 0, 'counterSteps': 0}
        let save = JSON.stringify(saveModel);
        window.sessionStorage.setItem('currentModelStateMatch3', save);
        };
    }
}