import { useState, useCallback, useRef, useEffect } from 'react'
import './Calculator.css'

const OPERATIONS = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => (b === 0 ? null : a / b),
}

const SYMBOLS = { add: '+', subtract: '-', multiply: '*', divide: '/' }

function Calculator() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState(null)
  const [operation, setOperation] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const displayRef = useRef(null)

  const formatNumber = useCallback((num) => {
    const str = String(num)
    if (str.length > 10) return Number(num).toExponential(5)
    return str
  }, [])

  const inputDigit = useCallback(
    (digit) => {
      if (waitingForOperand) {
        setDisplay(String(digit))
        setWaitingForOperand(false)
      } else {
        setDisplay((prev) =>
          prev === '0' && digit !== '.' ? String(digit) : prev + digit
        )
      }
    },
    [waitingForOperand]
  )

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (!display.includes('.')) {
      setDisplay((prev) => prev + '.')
    }
  }, [display, waitingForOperand])

  const clear = useCallback(() => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }, [])

  const toggleSign = useCallback(() => {
    setDisplay((prev) => {
      if (prev === 'Error') return prev
      const value = parseFloat(prev)
      if (Number.isNaN(value)) return prev
      const result = -value
      return formatNumber(result)
    })
  }, [formatNumber])

  const inputPercent = useCallback(() => {
    const value = parseFloat(display)
    setDisplay(String(value / 100))
  }, [display])

  const performOperation = useCallback(
    (nextOp) => {
      const inputValue = parseFloat(display)

      if (previousValue == null) {
        setPreviousValue(inputValue)
      } else if (operation) {
        const result = OPERATIONS[operation](previousValue, inputValue)
        if (result === null) {
          setDisplay('Error')
          setPreviousValue(null)
          setOperation(null)
        } else {
          setDisplay(formatNumber(result))
          setPreviousValue(result)
        }
      }

      setWaitingForOperand(true)
      setOperation(nextOp)
    },
    [display, previousValue, operation, formatNumber]
  )

  const calculate = useCallback(() => {
    if (operation == null || previousValue == null) return

    const inputValue = parseFloat(display)
    const result = OPERATIONS[operation](previousValue, inputValue)

    if (result === null) {
      setDisplay('Error')
    } else {
      setDisplay(formatNumber(result))
    }

    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(true)
  }, [display, previousValue, operation, formatNumber])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key >= '0' && e.key <= '9') inputDigit(e.key)
      else if (e.key === '.') inputDecimal()
      else if (e.key === 'Backspace') clear()
      else if (e.key === 'Escape') clear()
      else if (e.key === '+') performOperation('add')
      else if (e.key === '-') performOperation('subtract')
      else if (e.key === '*') performOperation('multiply')
      else if (e.key === '/') {
        e.preventDefault()
        performOperation('divide')
      } else if (e.key === 'Enter') {
        e.preventDefault()
        calculate()
      }
    },
    [inputDigit, inputDecimal, clear, performOperation, calculate]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const buttons = [
    { id: 'clear', label: 'AC', className: 'func', action: clear },
    { id: 'toggle', label: '+/-', className: 'func', action: toggleSign },
    { id: 'percent', label: '%', className: 'func', action: inputPercent },
    { id: 'divide', label: '/', className: 'op', action: () => performOperation('divide') },
    { id: '7', label: '7', action: () => inputDigit('7') },
    { id: '8', label: '8', action: () => inputDigit('8') },
    { id: '9', label: '9', action: () => inputDigit('9') },
    { id: 'multiply', label: '*', className: 'op', action: () => performOperation('multiply') },
    { id: '4', label: '4', action: () => inputDigit('4') },
    { id: '5', label: '5', action: () => inputDigit('5') },
    { id: '6', label: '6', action: () => inputDigit('6') },
    { id: 'subtract', label: '-', className: 'op', action: () => performOperation('subtract') },
    { id: '1', label: '1', action: () => inputDigit('1') },
    { id: '2', label: '2', action: () => inputDigit('2') },
    { id: '3', label: '3', action: () => inputDigit('3') },
    { id: 'add', label: '+', className: 'op', action: () => performOperation('add') },
    { id: '0', label: '0', action: () => inputDigit('0'), span: 2 },
    { id: 'decimal', label: '.', action: inputDecimal },
    { id: 'equals', label: '=', className: 'equals', action: calculate },
  ]

  const getDisplayContent = () => {
    if (display === 'Error') return display
    const formatted = (() => {
      const num = parseFloat(display)
      return Number.isNaN(num) ? display : formatNumber(num)
    })()
    if (operation) {
      const prev = formatNumber(previousValue)
      return waitingForOperand
        ? `${prev} ${SYMBOLS[operation]}`
        : `${prev} ${SYMBOLS[operation]} ${formatted}`
    }
    return formatted
  }

  return (
    <div className="calculator" role="application" aria-label="Calculator">
      <div
        ref={displayRef}
        className="display"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="display-value">{getDisplayContent()}</span>
      </div>
      <div className="keypad">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            id={btn.id}
            className={`btn ${btn.className || ''} ${btn.span ? 'span-2' : ''}`}
            onClick={btn.action}
            aria-label={btn.label}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Calculator
