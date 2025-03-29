import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './NotificationSettings.css';

function NotificationSettings({ user }) {
  const [notifications, setNotifications] = useState({
    daily: true,
    weekly: false,
    email: false
  });
  const { t } = useLanguage();

  useEffect(() => {
    // 알림 권한 상태 확인
    if ('Notification' in window) {
      // 저장된 알림 설정 불러오기
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        const { enabled, time } = JSON.parse(savedSettings);
        setNotifications({
          daily: enabled,
          weekly: false,
          email: false
        });
      }
    }
  }, []);

  const handleChange = (setting) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        setNotifications({
          daily: true,
          weekly: false,
          email: false
        });
        saveSettings(true, '09:00');
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
    if (!notifications.daily && Notification.permission !== 'granted') {
      requestPermission();
    } else {
      setNotifications(prev => ({
        ...prev,
        daily: !prev.daily
      }));
      saveSettings(!notifications.daily, '09:00');
    }
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    saveSettings(notifications.daily, newTime);
  };

  return (
    <div className="settings-section">
      <h2>알림 설정</h2>
      <div className="settings-content">
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={notifications.daily}
              onChange={handleToggle}
            />
            매일 새로운 명언 알림
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={notifications.weekly}
              onChange={() => handleChange('weekly')}
            />
            주간 리마인더
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={() => handleChange('email')}
            />
            이메일 알림
          </label>
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings; 