import React from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const InputLabel = styled.label`
  font-family: 'Toasty Milk';
  font-size: 18px;
  font-weight: bold;
  color: black;
  text-align: center;
  user-select: none;
`;

const StyledInput = styled.input`
  width: 80%;
  padding: 12px 16px;
  font-family: 'Toasty Milk';
  font-size: 18px;
  font-weight: bold;
  color: black;
  background-color: white;
  border: 4px solid black;
  border-radius: 8px;
  text-align: center;
  outline: none;
  box-shadow: 0px 4px 0px rgba(0, 0, 0, 1);
  transition: all 0.15s ease;
  
  &:focus {
    transform: translate(0px, -2px);
    box-shadow: 0px 6px 0px rgba(0, 0, 0, 1);
  }
  
  &::placeholder {
    color: #888;
    font-weight: normal;
  }
`;

interface CartoonInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  maxLength?: number;
  type?: string;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

const CartoonInput: React.FC<CartoonInputProps> = ({
  value,
  onChange,
  placeholder = "Enter text...",
  label,
  maxLength,
  type = "text",
  onKeyPress
}) => {
  return (
    <InputContainer>
      {label && <InputLabel>{label}</InputLabel>}
      <StyledInput
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        onKeyPress={onKeyPress}
      />
    </InputContainer>
  );
};

export default CartoonInput;
