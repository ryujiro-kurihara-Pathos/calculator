import { getNumberOfCurrencyDigits } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

type Operator = '+' | '-' | '×' | '÷' | '=';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('calculator-app');

  previousNumber: string | null = null;
  currentNumber: string = '0';
  isNewInput: boolean = false;
  operator: Operator | null = null;
  lastOperator: Operator | null = null;
  lastValue: string | null = null;
  changeLastValue: boolean = false;

  // 数字ボタン
  pushedNumber(num: number) {
    if(this.currentNumber === 'Error') return;

    // 例：0,3,15の場合
    if(this.previousNumber === null) {
      if(this.digitsOverflow(num)) return;
      if(this.isNewInput) {
        this.currentNumber = num.toString();
        this.isNewInput = false;
      } else {
        this.appendNumber(num);
      }
    } else {
      // 例：2+,10-の場合
      if(this.isNewInput) {
        if(this.previousNumber === null) {
          this.previousNumber = this.currentNumber;
          this.currentNumber = num.toString();
        } else {
          this.currentNumber = num.toString();
          this.isNewInput = false;
        }
      } else {
        // 例：2+5,18-4の場合
        if(this.digitsOverflow(num)) return;
        this.appendNumber(num);
      }
    }
  }

  // 数字を追加
  appendNumber(number: number) {
    if(this.currentNumber === 'Error') return;
    
    if(this.currentNumber === '0') {
      this.currentNumber = number.toString();
    } else {
      if(this.currentNumber === '-' && number === 0) {
        this.currentNumber = '0';
        return;
      }
      this.currentNumber = this.currentNumber + number.toString();
    }
  }

  // 演算子ボタン
  setOperator(ope: Operator) {
    //const calculatedNumber: string = this.calculate(this.operator!, prevNumber, curNumber);

    if(this.currentNumber === 'Error') return;

    // 例：0,3,15の場合 
    if(this.previousNumber === null) {
      // 値が-だけの場合、-は無視し、その他の場合0にする
      if(this.currentNumber === '-') {
        if(ope === '-') return;
        this.currentNumber = '0';
        return;
      }

      // 小数点で終わっていたら、小数点を削除
      if(this.currentNumber.endsWith('.')) {
        this.currentNumber = this.currentNumber.slice(0, -1);
      }

      // =ボタンが押された場合
      if(ope === '=') {
        // 前の演算子と前の数値がある場合
        if(this.lastOperator !== null && this.lastValue !== null) {
          if(this.changeLastValue) {
            const curNumber: number = Number(this.currentNumber);

            // 今やってるところ
            if(this.lastOperator === '+') {
              this.currentNumber = (curNumber + Number(this.lastValue)).toString();
              this.lastValue = curNumber.toString();
            } else if(this.lastOperator === '-') {
              this.currentNumber = (-curNumber + Number(this.lastValue)).toString();
              this.lastValue = curNumber.toString();
            } else if(this.lastOperator === '×') {
              this.currentNumber = (curNumber * curNumber).toString();
              this.lastValue = curNumber.toString();
            } else if(this.lastOperator === '÷') {
              this.currentNumber = (1 / curNumber).toString();
              this.lastValue = curNumber.toString();
            }
            this.changeLastValue = false;
          } else {
            this.currentNumber = this.calculate(this.lastOperator, this.currentNumber, this.lastValue!);
          }
        }
        this.currentNumber = Number(Number(this.currentNumber).toFixed(8)).toString();
        this.isNewInput = true;
      } else {
        // =ボタン以外の演算子が押された場合

        // 今やってるところ
        if(this.lastOperator !== null) {
          this.lastOperator = ope;
          this.operator = ope;
          this.changeLastValue = true;
          //this.previousNumber = this.currentNumber;
          return;
        }
        
        if(this.currentNumber === '0') {
          if(ope === '-') {
            this.currentNumber = '-';
            return;
          }
        }
        this.previousNumber = this.currentNumber;
        this.operator = ope;
        this.isNewInput = true;
      }
    } else {
      // 例：2+,10-の場合
      if(this.isNewInput) {
        if(ope === '=') {
          this.lastOperator = this.operator;
          const curNumberString: string = this.currentNumber;

          if(this.operator === '+') this.currentNumber = (Number(this.currentNumber) + Number(this.lastValue)).toString();
          else if(this.operator === '-') this.currentNumber = (-Number(this.currentNumber) + Number(this.lastValue)).toString();
          else if(this.operator === '×') this.currentNumber = (Number(this.currentNumber) * Number(this.currentNumber)).toString();
          else if(this.operator === '÷') this.currentNumber = (1 / Number(this.currentNumber)).toString();

          this.lastValue = curNumberString;
          this.previousNumber = null;
          this.operator = null;
        } else {
          this.operator = ope;
        }
      } else {
        // 例：2+5,18-4の場合
        const calculatedNumber: string = this.calculate(this.operator!, this.previousNumber!, this.currentNumber!);
        // エラーの場合は、オペレーターと前の数値をクリア
        if(calculatedNumber === 'Error') {
          this.currentNumber = 'Error';
          this.operator = null;
          this.previousNumber = null;
          return;
        }
        // =ボタンが押された場合
          this.lastOperator = this.operator;
          if(this.operator === '+' || this.operator === '-' || this.operator === '÷') this.lastValue = this.currentNumber;
          else if(this.operator === '×') this.lastValue = this.previousNumber;
        if(ope === '=') {
          this.currentNumber = this.calculate(this.operator!, this.previousNumber!, this.currentNumber!);
          this.previousNumber = null;
          this.operator = null;
        } else {
          // =以外の演算子ボタンが押された場合
          this.previousNumber = calculatedNumber;
          this.currentNumber = calculatedNumber;
          this.operator = ope;
        }
        this.isNewInput = true;
      }
    }
  }

  // 四則演算
  calculate(ope: Operator, numString1: string, numString2: string) {
    const num1: number = Number(numString1);
    const num2: number = Number(numString2);
    let result: number = 0;

    if(ope === '+') result = num1 + num2;
    else if(ope === '-') result = num1 - num2;
    else if(ope === '×') result = num1 * num2;
    else if(ope === '÷') {
      if(num2 === 0) return 'Error';
      result = num1 / num2;
    }

    if(this.getNumberOfDigits(result.toString(), true) > 10) return 'Error';
    result = Number(result.toFixed(8));
    
    this.operator = ope;
    return result.toString();
  }

  // 桁数を取得
  getNumberOfDigits(numString: string, isInteger: boolean) {
    if(isInteger) return numString.split('.')[0]?.length || 0;
    else return numString.split('.')[1]?.length || 0;
  }

  // 小数点が含まれているかどうか
  includesDecimal() {
    return this.currentNumber.includes('.');
  }

  // 
  digitsOverflow(num: number) {
    const integerDigits: number = this.getNumberOfDigits((this.currentNumber), true);
    const decimalDigits: number = this.getNumberOfDigits(this.currentNumber, false);

    // 整数の桁数が10桁以上かつ小数点がない場合は入力できない
    if(integerDigits >= 10 && !this.includesDecimal()) return true;
    // 小数の桁数が7桁の場合は0を、8桁の場合はすべて入力できない
    if(decimalDigits >= 7) {
      if(num === 0) return true;
      if(decimalDigits === 8) return true;
    }
    return false;
  }


  // √ボタン
  sqrt() {
    if(this.currentNumber === 'Error') return;
    if(Number(this.currentNumber) < 0) {
      this.currentNumber = 'Error';
      return;
    }
    this.isNewInput = false;
    this.currentNumber = Math.sqrt(Number(this.currentNumber)).toString();
  }

  // %ボタン"
  percent() {
    const curNumber: number = Number(this.currentNumber);
    const prevNumber: number = Number(this.previousNumber);

    if(this.currentNumber === 'Error') return;

    if(this.previousNumber === null) {
      if(this.lastOperator === '+' || this.lastOperator === '-') return;
      else if(this.lastOperator === '×') {
        this.currentNumber = (curNumber * Number(this.lastValue!) / 100).toString();
        return;
      } else if(this.lastOperator === '÷') {
        this.currentNumber = (curNumber / Number(this.lastValue!) * 100).toString();
        return;
      }
      this.currentNumber = '0';
    } else {
      if(this.isNewInput) return;

      this.lastOperator = this.operator;
      this.lastValue = this.operator === '÷' ? this.currentNumber : this.previousNumber;

      if(this.operator === '+') this.currentNumber = (prevNumber * (1 + curNumber / 100)).toString();
      else if(this.operator === '-') this.currentNumber = (prevNumber * (1 - curNumber / 100)).toString();
      else if(this.operator === '×') this.currentNumber = (prevNumber * curNumber / 100).toString();
      else if(this.operator === '÷') this.currentNumber = (prevNumber / curNumber * 100).toString();
    }

    this.previousNumber = null;
    this.operator = null;
  }

  // ACボタン
  clearAll() {
    this.previousNumber = null;
    this.currentNumber = '0';
    this.operator = null;
    this.clearLastValueAndOperator();
  }

  // CEボタン
  clearEntry() {
    if(this.currentNumber == 'Error') return;
    if(this.isNewInput) return;
    this.currentNumber = '0';
    this.clearLastValueAndOperator();
  }

  clearLastValueAndOperator() {
    this.lastOperator = null;
    this.lastValue = null;
  }

  // +/-ボタン
  toggleSign() {
    if(this.currentNumber === 'Error') return;
    //if(this.isNewInput) return;
    this.currentNumber = (-Number(this.currentNumber)).toString();
  }

  // .ボタン
  appendDecimal() {
    if(this.currentNumber === 'Error') return;
    if(this.isNewInput) {
      this.currentNumber = '0.';
      this.isNewInput = false;
    } else {
      if(this.currentNumber.includes('.')) return;
      this.currentNumber = this.currentNumber + '.';
    }
  }
}