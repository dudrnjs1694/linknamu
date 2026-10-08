export type LinkItem = {
  id: string;
  title: string;
  url: string;
};

export type Profile = {
  name: string;
  bio: string;
  // 프로필 사진 URL. 비워두면 이름의 첫 글자를 원형으로 표시합니다.
  imageUrl: string;
  links: LinkItem[];
};

// 여기만 수정하면 링크나무 페이지 내용이 바뀝니다.
// 링크 id는 클릭 수 집계 키이므로 한 번 정하면 바꾸지 마세요.
// 현재 값은 화면 확인용 더미 데이터입니다.
export const profile: Profile = {
  name: "김개발",
  bio: "풀스택 개발자ㅣ요즘에는 AI 개발에 관심이 많아요",
  imageUrl: "https://placehold.co/150x150/orange/white",
  links: [
    { id: "github", title: "GitHub", url: "https://github.com/example" },
    { id: "linkedin", title: "LinkedIn", url: "https://www.linkedin.com/in/example" },
    { id: "blog", title: "블로그", url: "https://example.com/blog" },
  ],
};
