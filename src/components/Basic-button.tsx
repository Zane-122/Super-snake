import React from 'react';
import styled from 'styled-components';
import { NamedTupleMember } from 'typescript';

const ButtonWrapper = styled.div`
    position: relative;
    margin: 10px;
`;

const ButtonShadow = styled.div<{ size: 'small' | 'medium' | 'large' }>`
    position: absolute;
    top: ${props => props.size === 'small' ? '6px' : props.size === 'medium' ? '8px' : '12px'};
    left: 0;
    right: 0;
    height: 100%;
    background-color: rgba(0, 0, 0, 1);
    border-radius: 10px;
    z-index: 1;
`;

const Button = styled.button<{ size: 'small' | 'medium' | 'large', color: string, textColor: string }>`
    background-color: ${props => props.color};
    color: ${props => props.textColor};
    height: ${props => props.size === 'small' ? '50px' : props.size === 'medium' ? '75px' : '100px'};
    min-width: ${props => props.size === 'small' ? '150px' : props.size === 'medium' ? '250px' : '350px'};
    padding: 10px 20px;
    border-radius: 10px;
    border: 4px solid #000;
    cursor: pointer;
    font-size: ${props => props.size === 'small' ? '18px' : props.size === 'medium' ? '24px' : '44px'};
    font-weight: bold;
    font-family: 'Toasty Milk', sans-serif;
    letter-spacing: 1px;
    position: relative;
    z-index: 2;
    transition: transform 0.1s ease;
    
    &:hover {
        transform: translateY(${props => props.size === 'small' ? '2px' : props.size === 'medium' ? '3px' : '4px'});
    }
    
    &:active {
        transform: translateY(${props => props.size === 'small' ? '6px' : props.size === 'medium' ? '8px' : '12px'});
    }
`; 

interface BasicButtonProps {
    label: string;
    color: string;
    textColor?: string;
    onClick: () => void;
    size: 'small' | 'medium' | 'large';
}

const BasicButton = ({ label, color, textColor="black", size = 'medium', onClick }: BasicButtonProps) => {
    return (
        <ButtonWrapper>
            <ButtonShadow size={size} />
            <Button size={size} color={color} textColor={textColor} onClick={onClick}>{label}</Button>
        </ButtonWrapper>
    );
};

export default BasicButton;