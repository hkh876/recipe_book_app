module.exports = {
  apps: [
    {
      name: "recipe-book-server",
      // java 실행 파일 경로
      script: "java",
      // 실행 인자 (절대 경로로 지정하면 가장 확실합니다)
      args: "-jar /server/book.jar",
      // 백엔드 작업 디렉토리 (로그 등이 쌓이는 위치)
      cwd: "/server"
    },
    {
      name: "recipe-book-app",
      script: "npm",
      args: "start",
      cwd: "/app",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
}