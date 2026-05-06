import React from 'react';
import { Button, Modal } from 'antd';
import './styles.scss';

export default function ModalFeature(props) {
  const { isModalOpen, handleOk, handleCancel, width = 420 } = props;
  return (
    <Modal
      className="modal-feature"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={false}
      width={width}
      centered
      closable={false}
    >
      {/* Icon header */}
      <div className="modal-feature__icon-wrap">
        <div className="modal-feature__icon-ring">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 15a1 1 0 110-2 1 1 0 010 2zm1-4a1 1 0 01-2 0V8a1 1 0 012 0v5z"
              fill="url(#featureGrad)" />
            <defs>
              <linearGradient id="featureGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#AC48A3"/>
                <stop offset="1" stopColor="#90278F"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Title */}
      <div className="modal-feature__title">
        Tính năng chưa khả dụng
      </div>

      {/* Description */}
      <div className="modal-feature__desc">
        Tính năng này vẫn đang trong giai đoạn phát triển. Vui lòng quay lại sau để sử dụng khi đã sẵn sàng.
      </div>

      {/* Button */}
      <div className="modal-feature__actions">
        <Button className="modal-feature__btn" type="primary" onClick={handleCancel}>
          Đã hiểu
        </Button>
      </div>
    </Modal>
  );
}
