class CalcControler {
    constructor() { //Executa já na declaração da classe
        //Atributos
        this._audio = new Audio('click.mp3'); //API do navegador procurar Audio Web API
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector('#display');
        this._dateEL = document.querySelector('#data');
        this._timeEL = document.querySelector('#hora');
        this._currentDate;
        //Executa todos os metodos
        this.initialize();
        this.initButtonEvents();
        this.initKeyboard();
    }

    copyToClipboard() {
        let input = document.createElement('input');
        input.value = this.displayCalc;
        document.body.appendChild(input); //Adiciona o input dentro do body html
        input.select();
        document.execCommand("Copy");
        input.remove(); //Remove o input
    }

    pastFromClipboard(){
        document.addEventListener('paste',e=>{
            let text = e.clipboardData.getData('Text');
            this.displayCalc = parseFloat(text);
        });
    }

    initialize() {

        //Apresenta a data e hora na tela da calculadora
        setInterval(() => {
            this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
            this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        }, 1000);

        //Inicia o display com 0
        this.displayCalc = 0;

        //Inicializa a função colar com o CTRL_V
        this.pastFromClipboard();

        //Evento de duplo clique no botão AC para ligar o audio
        document.querySelectorAll('.btn-ac').forEach(btn=>{ //For each pq retorna 2 itens
            btn.addEventListener('dblclick',e=>{
                this.toggleAudio();
            });
        });
    }

    toggleAudio(){
        
        this._audioOnOff = !this._audioOnOff;

    }

    playAudio(){
        if (this._audioOnOff){
            this._audio.currentTime = 0; //Força o audio voltar para o inicio mesmo não tendo terminado
            this._audio.play();
        }
    }

    initKeyboard() {
        document.addEventListener('keyup', e => {
            console.log(e.key);
            
            this.playAudio();

            switch (e.key) {
                case 'Escape': //Limpa tudo
                    this.clearAll();
                    break;
                case 'Backspace': //Limpa a ultima entrada
                    this.clearEntry();
                    break;
                case '-':
                case '*':
                case '/':
                case '+':
                case '%':
                    this.addOperation(e.key)
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key))
                    break;
                case '=':
                case 'Enter':
                    this.calc();
                    break;
                case '.':
                case ',':
                    this.addOperation('.')
                    break;
                case 'c':
                    if (e.ctrlKey) {
                        this.copyToClipboard();
                    }
                    break;
            }
        });

    }

    initButtonEvents() {
        let buttons = document.querySelectorAll("#buttons > g,#parts > g"); //Seleciona todos elementos em buttons e em parts o botão e o texto

        //Percorre todos os botoes
        buttons.forEach(btn => {
            //Adiciona o listerner de eventos em cada botão
            this.addEventListenerAll(btn, 'click drag', e => {
                //Pega a classe do botão
                let text = btn.className.baseVal.replace('btn-', '');
                this.execBtn(text);
            });

            //Eventos de mouse
            this.addEventListenerAll(btn, 'mouseover mouseup mousedown', e => {
                //Muda o cursor
                btn.style.cursor = "pointer";
            });

        });
    }

    getResult() {
        try {
            return eval(this._operation.join(''));    
        } catch (error) {
            setTimeout(() => {
                this.setErro();
            }, 1);
        }
    }

    clearAll() {

        this._operation = [];
        this._lastNumber = '';
        this.lastOperation = '';
        this.displayCalc = "0";

    }

    clearEntry() {
        this.setLastOperation = 0;
        this.displayCalc = "0";
    }

    setErro() {
        this.displayCalc = "Error";
    }

    getLastOperation() {
        return this._operation[this._operation.length - 1];
    }

    isOperator(value) {

        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);

    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    }

    pushOperation(value) {
        this._operation.push(value);

        if (this._operation.length > 3) {

            this.calc();

        }
    }

    getLastItem(isOperator = true) {
        let lastItem;

        for (let i = this._operation.length - 1; i >= 0; i--) {
            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }
        }

        if (!lastItem) {
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber; //IF ternario
        }

        return lastItem;

    }

    calc() {

        let last = '';

        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if (this._operation.length > 3) {
            last = this._operation.pop(); //Retira o ultimo elemento e guarda na variavel
            this._lastNumber = this.getResult();
        } else if (this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false)
        }

        let result = eval(this._operation.join(''));

        //Tratamento se porcentagem
        if (last == '%') {
            result = result / 100;
            this._operation = [result]
        } else {
            this._operation = [result]

            if (last) this._operation.push(last);
        }
        this.lastNumberToDisplay();
    }

    lastNumberToDisplay() {
        let lastnumber = this.getLastItem(false);

        if (!lastnumber) this._lastNumber = 0;

        this.displayCalc = lastnumber;
    }

    addOperation(value) {

        if (isNaN(this.getLastOperation())) {
            //String]
            if (this.isOperator(value)) {
                //Troca o operador
                this.setLastOperation(value);
            } else if (isNaN(value)) {
                this.addDot();
            } else {
                //Adiciona no array
                this.pushOperation(value);
                this.lastNumberToDisplay();
            }

        } else {

            if (this.isOperator(value)) {
                this.pushOperation(value);
            } else if (isNaN(value)) {
                this.addDot();
            } else {
                //Numero
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);

                this.lastNumberToDisplay();
            }

        }

    }

    addDot() {
        let lastOperation = this.getLastOperation();

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        console.log('this.isOperator(lastOperation) = ', this.isOperator(lastOperation));
        console.log('!lastOperation', !lastOperation);

        if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation('0.');
        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.lastNumberToDisplay();
    }

    execBtn(value) {
        
        this.playAudio();

        switch (value) {
            case 'ac': //Limpa tudo
                this.clearAll();
                break;
            case 'ce': //Limpa a ultima entrada
                this.clearEntry();
                break;
            case 'subtracao':
                this.addOperation('-')
                break;
            case 'multiplicacao':
                this.addOperation('*')
                break;
            case 'divisao':
                this.addOperation('/')
                break;
            case 'soma':
                this.addOperation('+')
                break;
            case 'porcento':
                this.addOperation('%')
                break;
            case 'igual':
                this.calc();
                break;
            case 'ponto':
                this.addOperation('.')
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));

                break;
            default:
                this.setError();
                break;
        }
    }

    get displayCalc() {
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value) {
        if (value.toString().length > 10){
            this.setErro()
            return;
        }else{
            this._displayCalcEl.innerHTML = value;
        }
    }

    get displayDate() {
        return this._dateEL.innerHTML;
    }

    set displayDate(value) {
        this._dateEL.innerHTML = value;
    }

    get displayTime() {
        return this._timeEL.innerHTML;
    }

    set displayTime(value) {
        this._timeEL.innerHTML = value;
    }

    get currentDate() {
        return new Date();
    }

    addEventListenerAll(element, events, fn) {
        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        });
    }
}