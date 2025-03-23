# Daily Thought (데일리 써트)

매일 새로운 명언을 통해 나의 생각을 기록하고 공유하는 앱입니다.

## 주요 기능

- 매일 새로운 명언 제공
- 명언에 대한 나의 생각 기록
- 기록된 생각 검색 및 관리
- SNS 공유 기능 (트위터, 페이스북, 인스타그램, 카카오톡)
- 다크/라이트 테마 지원
- 다국어 지원 (한국어, 영어)

## 기술 스택

- React
- Capacitor
- Firebase Authentication
- Context API
- PWA (Progressive Web App)

## 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/yourusername/dailythought.git
cd dailythought
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm start
```

4. 안드로이드 빌드
```bash
npm run build
npx cap sync
npx cap open android
```

## 환경 설정

1. Firebase 설정
- .env 파일 생성
- Firebase 설정 정보 추가

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 라이선스

MIT License

## 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 