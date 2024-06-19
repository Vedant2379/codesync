import connectDB from "@/config/database";
import Contest from "@/models/Contest";
import Team from "@/models/Team";
import User from "@/models/User";

export const POST = async (request) => {
  try {
    const data = await request.json();

    await connectDB();

    const {
      codeforcesId1,
      codeforcesId2,
      codeforcesId3,
      numQuestions,
      lowerDifficulty,
      upperDifficulty,
      timeLimit,
      shuffleOrder,
      tags,
      contestantType,
      selectedTeam,
    } = data;

    if (
      !codeforcesId1 ||
      !numQuestions ||
      !lowerDifficulty ||
      !upperDifficulty ||
      !timeLimit ||
      shuffleOrder == undefined ||
      !tags ||
      !contestantType
    ) {
      return new Response(
        JSON.stringify({ message: "Fill all the fields", ok: false }),
        {
          status: 400,
        }
      );
    }

    const uniqueHandles = new Set([codeforcesId1, codeforcesId2, codeforcesId3].filter(Boolean));
    if (uniqueHandles.size !== [codeforcesId1, codeforcesId2, codeforcesId3].filter(Boolean).length) {
      return new Response(
        JSON.stringify({ message: "Duplicate Codeforces handles are not allowed", ok: false }),
        { status: 400 }
      );
    }

    const total_questions = await fetch(
      `https://codeforces.com/api/problemset.problems`
    ).then(async (data) => await data.json());

    if (total_questions.status === "FAILED") {
      return new Response(
        JSON.stringify({ message: "Failed to fetch questions", ok: false }),
        { status: 500 }
      );
    }

    const user1_from_cf_submissions = await fetch(
      `https://codeforces.com/api/user.status?handle=${codeforcesId1}&from=1&count=100000`
    ).then(async (data) => await data.json());

    if (user1_from_cf_submissions.status === "FAILED") {
      return new Response(
        JSON.stringify({
          message: `Codeforces handle ${codeforcesId1} is invalid`,
          ok: false,
        }),
        { status: 400 }
      );
    }

    const st = new Set();

    user1_from_cf_submissions.result.forEach((problem) => {
      st.add(`${problem.problem.contestId}${problem.problem.index}`);
    });

    if (codeforcesId2 !== "") {
      const user2_from_cf_submissions = await fetch(
        `https://codeforces.com/api/user.status?handle=${codeforcesId2}&from=1&count=100000`
      ).then(async (data) => await data.json());

      if (user2_from_cf_submissions.status === "FAILED") {
        return new Response(
          JSON.stringify({
            message: `Codeforces handle ${codeforcesId2} is invalid`,
            ok: false,
          }),
          { status: 400 }
        );
      }

      user2_from_cf_submissions.result.forEach((problem) => {
        st.add(`${problem.problem.contestId}${problem.problem.index}`);
      });
    }

    if (codeforcesId3 !== "") {
      const user3_from_cf_submissions = await fetch(
        `https://codeforces.com/api/user.status?handle=${codeforcesId3}&from=1&count=100000`
      ).then(async (data) => await data.json());

      if (user3_from_cf_submissions.status === "FAILED") {
        return new Response(
          JSON.stringify({
            message: `Codeforces handle ${codeforcesId3} is invalid`,
            ok: false,
          }),
          { status: 400 }
        );
      }

      user3_from_cf_submissions.result.forEach((problem) => {
        st.add(`${problem.problem.contestId}${problem.problem.index}`);
      });
    }

    let newList = [];
    const startTime = Date.now();
    const timeLimitMillis = 10000;

    while (newList.length < numQuestions) {
      if (Date.now() - startTime > timeLimitMillis) {
        return new Response(
          JSON.stringify({
            message: "Time limit reached while fetching questions",
            ok: false,
          }),
          { status: 408 }
        );
      }
      let index = Math.floor(
        Math.random() * (5500) + 1500
      );
      const problem = total_questions.result.problems[index];

      if (
        !st.has(`${problem.contestId}${problem.index}`) &&
        problem.rating <= upperDifficulty &&
        problem.rating >= lowerDifficulty &&
        problem.tags.some((tag) => tags.includes(tag)) &&
        !newList.includes(problem)
      ) {
        newList.push(problem)
      }
    }

    if (!shuffleOrder) {
      newList.sort((a, b) => a.rating - b.rating);
    }

    let contestants = [];
    if (codeforcesId1 !== "") {
      const user = await fetch(
        `https://codeforces.com/api/user.info?handles=${codeforcesId1}&checkHistoricHandles=false`
      ).then(async (data) => await data.json());
      contestants.push(user.result[0].handle);
    }
    if (codeforcesId2 !== "") {
      const user = await fetch(
        `https://codeforces.com/api/user.info?handles=${codeforcesId2}&checkHistoricHandles=false`
      ).then(async (data) => await data.json());
      contestants.push(user.result[0].handle);
    }
    if (codeforcesId3 !== "") {
      const user = await fetch(
        `https://codeforces.com/api/user.info?handles=${codeforcesId3}&checkHistoricHandles=false`
      ).then(async (data) => await data.json());
      contestants.push(user.result[0].handle);
    }

    if (contestantType === "Team" && contestants.length < 2) {
      return new Response(
        JSON.stringify({
          message: "In team mode, provide at least 2 participants",
          ok: false,
        }),
        { status: 400 }
      );
    }

    let users = [];

    for (const contestant of contestants) {
      const user = await User.findOne({ codeforcesId: contestant });
      if (user) {
        users.push(user);
      }
    }

    const now = new Date();
    const newDate = new Date(now.getTime() + timeLimit * 60000);

    let teamId = selectedTeam;
    if (!teamId || teamId === "" || teamId === "Select Team") {
      teamId = undefined;
    }

    const contest = new Contest({
      users,
      problemList: newList,
      contestants,
      numberOfQuestions: numQuestions,
      lowerLimit: lowerDifficulty,
      upperLimit: upperDifficulty,
      timeLimit,
      timeStart: now.toISOString(), // Store start time in UTC
      timeEnding: newDate.toISOString(), // Store end time in UTC
      contestantType,
      team: teamId ? teamId : undefined,
    });

    await contest.save();

    const id = contest._id;

    return new Response(
      JSON.stringify({ message: "Contest created", id, ok: true }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: "Failed to create a contest", ok: false }),
      { status: 500 }
    );
  }
};
