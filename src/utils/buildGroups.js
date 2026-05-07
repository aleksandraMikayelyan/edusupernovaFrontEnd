/**
 * buildGroups — groups flat TestQuestionDTO[] into passage groups.
 *
 * Questions that share a groupId are bundled together under the same
 * contextText / audio passage.  Questions with no groupId each become
 * their own standalone group.
 *
 * Used by: ReadingTest, ListeningTest, ACTEnglishTest, SATReadingTest.
 */
export const buildGroups = (questions) => {
  const map = new Map();

  questions.forEach(q => {
    const key = q.groupId ?? `standalone_${q.quizId}`;
    if (!map.has(key)) {
      map.set(key, {
        groupId:           q.groupId,
        groupTitle:        q.groupTitle,
        contextText:       q.contextText,
        contextImageUrl:   q.contextImageUrl,
        minQuestionNumber: q.questionNumber ?? 9999,
        questions:         [],
      });
    }
    const g = map.get(key);
    if ((q.questionNumber ?? 9999) < g.minQuestionNumber)
      g.minQuestionNumber = q.questionNumber ?? 9999;
    g.questions.push(q);
  });

  map.forEach(g => {
    g.questions.sort((a, b) => (a.groupOrderIndex ?? 0) - (b.groupOrderIndex ?? 0));
  });

  return [...map.values()].sort((a, b) => a.minQuestionNumber - b.minQuestionNumber);
};

/**
 * getOptions — extract non-null options from a TestQuestionDTO as { letter, text } pairs.
 * Supports up to 5 options (A–E).
 */
export const getOptions = (q) =>
  ["A", "B", "C", "D", "E"]
    .map(l => ({ letter: l, text: q[`option${l}`] }))
    .filter(o => o.text);
