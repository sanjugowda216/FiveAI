export const apCourses = [
  { id: "ap-world-history", name: "AP World History: Modern", subject: "History", submissionMode: "essay" },
  { id: "ap-united-states-history", name: "AP United States History", subject: "History", submissionMode: "essay" },
  { id: "ap-european-history", name: "AP European History", subject: "History", submissionMode: "essay" },
  { id: "ap-government-politics-us", name: "AP U.S. Government & Politics", subject: "Social Science", submissionMode: "essay" },
  { id: "ap-psychology", name: "AP Psychology", subject: "Social Science", submissionMode: "essay" },
  { id: "ap-english-language", name: "AP English Language & Composition", subject: "Language Arts", submissionMode: "essay" },
  { id: "ap-english-literature", name: "AP English Literature & Composition", subject: "Language Arts", submissionMode: "essay" },
  { id: "ap-human-geography", name: "AP Human Geography", subject: "Social Science", submissionMode: "essay" },
  { id: "ap-spanish-language", name: "AP Spanish Language & Culture", subject: "World Language", submissionMode: "essay" },
  { id: "ap-french-language", name: "AP French Language & Culture", subject: "World Language", submissionMode: "essay" },
  { id: "ap-calculus-ab", name: "AP Calculus AB", subject: "Mathematics", submissionMode: "upload" },
  { id: "ap-calculus-bc", name: "AP Calculus BC", subject: "Mathematics", submissionMode: "upload" },
  { id: "ap-statistics", name: "AP Statistics", subject: "Mathematics", submissionMode: "upload" },
  { id: "ap-computer-science-a", name: "AP Computer Science A", subject: "Computer Science", submissionMode: "upload" },
  { id: "ap-computer-science-principles", name: "AP Computer Science Principles", subject: "Computer Science", submissionMode: "upload" },
  { id: "ap-biology", name: "AP Biology", subject: "Science", submissionMode: "upload" },
  { id: "ap-chemistry", name: "AP Chemistry", subject: "Science", submissionMode: "upload" },
  { id: "ap-physics-1", name: "AP Physics 1", subject: "Science", submissionMode: "upload" },
  { id: "ap-physics-2", name: "AP Physics 2", subject: "Science", submissionMode: "upload" },
  { id: "ap-physics-c-mechanics", name: "AP Physics C: Mechanics", subject: "Science", submissionMode: "upload" },
  { id: "ap-physics-c-electricity", name: "AP Physics C: Electricity & Magnetism", subject: "Science", submissionMode: "upload" },
  { id: "ap-environmental-science", name: "AP Environmental Science", subject: "Science", submissionMode: "essay" },
  { id: "ap-art-history", name: "AP Art History", subject: "Arts", submissionMode: "essay" },
  { id: "ap-studio-art-2d", name: "AP Studio Art: 2D Design", subject: "Arts", submissionMode: "upload" },
  { id: "ap-music-theory", name: "AP Music Theory", subject: "Arts", submissionMode: "upload" },
  { id: "ap-microeconomics", name: "AP Microeconomics", subject: "Social Science", submissionMode: "essay" },
  { id: "ap-macroeconomics", name: "AP Macroeconomics", subject: "Social Science", submissionMode: "essay" },
  { id: "ap-latin", name: "AP Latin", subject: "World Language", submissionMode: "essay" },
  { id: "ap-chinese-language", name: "AP Chinese Language & Culture", subject: "World Language", submissionMode: "essay" },
];

export const apCourseMap = Object.fromEntries(apCourses.map((course) => [course.id, course]));

export function getCourseById(courseId) {
  return apCourseMap[courseId] ?? null;
}

export function findCourseByName(name) {
  const lower = name?.toLowerCase?.();
  if (!lower) return null;
  return apCourses.find((course) => course.name.toLowerCase() === lower) ?? null;
}
