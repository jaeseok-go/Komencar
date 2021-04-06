import jwtDecode from "jwt-decode";

const state = {
  // 예시
  // news: [] as NewsItem[]
  token: sessionStorage.getItem("auth-token") || null,
  isLogin: sessionStorage.getItem("auth-token") === null ? false : true,
  userInfo:
    sessionStorage.getItem("auth-token") === null
      ? {}
      : jwtDecode(sessionStorage.getItem("auth-token")),
  modelInfo: sessionStorage.getItem("model-info") || null,
  latestModel: sessionStorage.getItem("latest-model") || null
};

// node_modules/vuex/types/vue.d.ts 삭제

type RootState = typeof state;

export { state, RootState };
