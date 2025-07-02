import React from 'react';
import styled from 'styled-components';

const ToggleContainer = styled.div<{ isOn: boolean, color?: string }>`
  position: relative;
  width: 70px;
  height: 40px;
  background-color: ${({ isOn, color }) => isOn ? (color ? color : 'rgb(217, 93, 255)') : 'rgba(255, 255, 255, 0.5)'};
  vertical-align: middle;
  border: 4px solid black;
  border-radius: 15px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  display: inline-block;
  box-shadow: 0px 4px 0px rgba(0, 0, 0, 1);
`;

const ToggleThumb = styled.div<{ isOn: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ isOn }) => isOn ? '32px' : '2px'};
  width: 28px;
  height: 28px;
  background-color: white;
  border: 4px solid black;
  border-radius: 10px;
  transition: left 0.15s ease;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 15px;
  flex-direction: column;
  cursor: pointer;
  font-family: 'Toasty Milk';
  font-size: 20px;
  color: black;
  font-weight: bold;
  user-select: none;
  padding: 8px;
`;

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
  label?: string;
  color?: string;
}

const Toggle: React.FC<ToggleProps> = ({ isOn, onToggle, label, color}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: 'fit-content', padding: "3px", backgroundColor: color ? color : 'rgba(255, 160, 249, 0.5)', borderRadius: '15px', border: '4px solid black'}}>
    <ToggleLabel onClick={onToggle}>
      {label && <span>{label}</span>}
      <ToggleContainer isOn={isOn} color={color}>
        <ToggleThumb isOn={isOn} />
      </ToggleContainer>
    </ToggleLabel>
    </div>
  );
};

export default Toggle; 