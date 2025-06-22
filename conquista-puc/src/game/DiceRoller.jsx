import { useState, useEffect } from 'react';
import './DiceRoller.css';

function DiceRoller({ onDiceResult, isRolling, diceEnabled, onToggleDice, diceResult }) {
  const [lastResult, setLastResult] = useState(null);
  const [isRollingDice, setIsRollingDice] = useState(false);

  useEffect(() => {
    if (diceResult && diceResult !== lastResult) {
      setLastResult(diceResult);
    }
  }, [diceResult, lastResult]);

  const rollDice = () => {
    if (isRollingDice) return;
    
    setIsRollingDice(true);
    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      setLastResult(result);
      onDiceResult(result);
      setIsRollingDice(false);
    }, 800);
  };

  const getDiceEffectText = (number) => {
    if (!number) return '';
    
    if (number % 2 === 1) {
      return {
        text: "Se pierde 1 refuerzo",
        type: "negative"
      };
    } else if (number === 2 || number === 4) {
      return {
        text: "1 refuerzo sera Ayudante",
        type: "positive"
      };
    } else if (number === 6) {
      return {
        text: "1 refuerzo sera Profesor",
        type: "excellent"
      };
    }
  };

  const getDiceFace = (number) => {
    const faces = {1:'⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅'};
    return faces[number] || '?';
  };

  const handleDiceToggle = (enabled) => {
    setLastResult(null);
    onToggleDice(enabled);
    
    if (enabled) {
      rollDice();
    }
  };

  const effect = getDiceEffectText(lastResult);

  return (
    <div className="dice-roller-container">
      <div className="dice-option-header">
        <h4>Opcion del Dado</h4>
        <div className="dice-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={diceEnabled}
              onChange={(e) => handleDiceToggle(e.target.checked)}
              disabled={isRolling || isRollingDice}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className={`toggle-label ${diceEnabled ? 'active' : ''}`}>
            {diceEnabled ? 'Activado' : 'Desactivado'}
          </span>
        </div>
      </div>

      {diceEnabled && (
        <div className="dice-info">
          <div className="dice-rules">
            <h5>Reglas del Dado:</h5>
            <div className="rules-grid">
              <div className="rule negative">
                <span className="rule-numbers">1, 3, 5</span>
                <span className="rule-effect">-1 refuerzo</span>
              </div>
              <div className="rule positive">
                <span className="rule-numbers">2, 4</span>
                <span className="rule-effect">Ayudante</span>
              </div>
              <div className="rule excellent">
                <span className="rule-numbers">6</span>
                <span className="rule-effect">Profesor</span>
              </div>
            </div>
          </div>

          {(lastResult || isRollingDice) && (
            <div className="dice-result">
              <div className="result-display">
                <div className={`dice-face ${isRollingDice ? 'rolling' : ''}`}>
                  {isRollingDice ? '?' : getDiceFace(lastResult)}
                </div>
                <div className="result-info">
                  <div className="result-number">
                    {isRollingDice ? 'Lanzando...' : `Resultado: ${lastResult}`}
                  </div>
                  {!isRollingDice && effect && (
                    <div className={`result-effect ${effect.type}`}>
                      <span className="effect-text">{effect.text}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!lastResult && !isRollingDice && (
            <div className="dice-preview">
              <div className="preview-dice">?</div>
              <p className="preview-text">
                Activa el dado para lanzarlo
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DiceRoller;
