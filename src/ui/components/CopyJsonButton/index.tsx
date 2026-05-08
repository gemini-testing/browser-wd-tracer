import { useState } from 'react';
import { Button } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';

const COPIED_RESET_DELAY_MS = 1500;

const useStyles = createStyles(({ token }) => ({
  button: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1,
    fontSize: '11px',
    gap: '3px',
    paddingInline: '6px',
    color: token.colorTextSecondary,
    border: `1px solid ${token.colorBorderSecondary}`,
    '&:hover': {
      borderColor: `${token.colorPrimary} !important`,
      color: `${token.colorPrimary} !important`,
    },
  },
}));

interface CopyJsonButtonProps {
  data: unknown;
  visible: boolean;
}

export function CopyJsonButton({ data, visible }: CopyJsonButtonProps) {
  const { styles } = useStyles();
  const [copied, setCopied] = useState(false);

  if (!visible || data == null) {
    return null;
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();

    const text = JSON.stringify(data, null, 2);

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_DELAY_MS);
    });
  };

  return (
    <Button
      className={styles.button}
      size="small"
      type="text"
      icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
      onClick={handleCopy}
    >
      {copied ? 'Copied!' : 'JSON'}
    </Button>
  );
}
