'use client';

import React from 'react';
import { Button, ButtonProps } from 'antd';

interface BaseButtonProps extends ButtonProps {
    customLabel?: string;
}

export const BaseButton: React.FC<BaseButtonProps> = ({ children, customLabel, ...props }) => {
    return <Button {...props}>{customLabel || children}</Button>;
};

export default BaseButton;  