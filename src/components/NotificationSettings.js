import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './NotificationSettings.css';

function NotificationSettings({ user }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [permission, setPermission] = useState('default');
  const { t } = useLanguage();

  useEffect(() => {
    // 알림 권한 상태 확인
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    
    // 저장된 알림 설정 불러오기
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      const { enabled, time } = JSON.parse(savedSettings);
      setIsEnabled(enabled);
      setNotificationTime(time);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setIsEnabled(true);
        saveSettings(true, notificationTime);
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
    }
  };

  const saveSettings = (enabled, time) => {
    const settings = { enabled, time };
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    
    if (enabled) {
      scheduleNotification(time);
    } else {
      cancelNotification();
    }
  };

  const scheduleNotification = (time) => {
    // 기존 알림 취소
    cancelNotification();

    // 새로운 알림 스케줄링
    const [hours, minutes] = time.split(':');
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      parseInt(hours),
      parseInt(minutes),
      0
    );

    // 이미 지난 시간이면 다음날로 설정
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime - now;
    const notificationId = setTimeout(() => {
      showNotification();
      // 다음날을 위한 알림 재설정
      scheduleNotification(time);
    }, timeUntilNotification);

    localStorage.setItem('notificationId', notificationId);
  };

  const cancelNotification = () => {
    const notificationId = localStorage.getItem('notificationId');
    if (notificationId) {
      clearTimeout(parseInt(notificationId));
      localStorage.removeItem('notificationId');
    }
  };

  const showNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification(t('app.title'), {
        body: t('notification.body'),
        icon: '/logo192.png'
      });
    }
  };

  const handleToggle = () => {
    if (!isEnabled && permission !== 'granted') {
      requestPermission();
    } else {
      setIsEnabled(!isEnabled);
      saveSettings(!isEnabled, notificationTime);
    }
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setNotificationTime(newTime);
    if (isEnabled) {
      saveSettings(true, newTime);
    }
  };

  return (
    <div className="notification-settings">
      <h3>{t('settings.notification.title')}</h3>
      <div className="notification-controls">
        <label className="switch">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={handleToggle}
            disabled={permission === 'denied'}
          />
          <span className="slider round"></span>
        </label>
        <span className="notification-label">
          {isEnabled ? t('settings.notification.enabled') : t('settings.notification.disabled')}
        </span>
      </div>
      
      {isEnabled && (
        <div className="time-selector">
          <label htmlFor="notification-time">{t('settings.notification.time')}</label>
          <input
            type="time"
            id="notification-time"
            value={notificationTime}
            onChange={handleTimeChange}
          />
        </div>
      )}

      {permission === 'denied' && (
        <p className="permission-warning">
          {t('settings.notification.permissionDenied')}
        </p>
      )}
    </div>
  );
}

export default NotificationSettings; 