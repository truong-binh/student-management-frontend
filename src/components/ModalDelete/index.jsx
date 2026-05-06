import React from 'react';
import { Button, Modal } from 'antd';
import './styles.scss';
import styles from './styles.module.scss';
import CircleExclamation from '../../assets/images/icons/light/circle-exclamation.svg';
import CircleCheck from '../../assets/images/icons/light/circle-check.svg';
import InlineSVG from 'react-inlinesvg';

export default function ModalDeleteDefault(props) {
  const {
    isModalOpen, loading, content, contentBtn,
    handleOk, handleCancel, handleConfirm, type, widthIcon = 52,
  } = props;

  const isSuccess = type && type === 'SUCCESS';
  const isDelete  = type && type === 'DELETE';

  const iconRingClass = isSuccess ? 'success' : isDelete ? 'delete' : 'warning';
  const iconFillClass = isSuccess ? 'fill-green-45' : isDelete ? 'fill-red-65' : 'fill-orange-55';

  return (
    <Modal
      className="general-dialog-wrap"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={false}
      closable={false}
      width={420}
      centered
    >
      <div className={styles.mainWrap}>
        {/* Animated icon ring */}
        <div className={`icon-ring ${iconRingClass} mb-5`}>
          <InlineSVG
            className={iconFillClass}
            src={isSuccess ? CircleCheck : CircleExclamation}
            width={widthIcon}
            height="auto"
          />
        </div>

        {/* Content text */}
        <div className="mb-7 text-center text-sm text-gray-35 leading-relaxed max-w-[300px]">
          {content}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-3 w-full">
          <Button
            className="main-btn-close flex-1 max-w-[140px] rounded-[10px] font-medium"
            size="large"
            onClick={() => handleCancel()}
          >
            Hủy
          </Button>
          <Button
            loading={loading}
            className={`${isDelete ? 'btn-delete-modal' : ''} flex-1 max-w-[140px] rounded-[10px] font-medium`}
            type="primary"
            size="large"
            onClick={() => handleConfirm()}
          >
            {contentBtn}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
