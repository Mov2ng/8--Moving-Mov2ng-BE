import {
  Client,
  GatewayIntentBits,
  NewsChannel,
  TextChannel,
} from "discord.js";
import cron from "node-cron";
import dotenv from "dotenv";

// .env 파일에서 환경변수를 불러오기 (process.env에서 사용 가능)
dotenv.config();

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.CHANNEL_ID;

if (!token || !channelId) {
  // 서버는 정상적으로 구동되지만 Discord 봇만 비활성화
  console.warn(
    "⚠️ DISCORD_TOKEN 또는 CHANNEL_ID가 없어 Discord 봇을 비활성화합니다."
  );
} else {
  const resolvedToken = token!;
  const resolvedChannelId = channelId!;

  // 디스코드 클라이언트 설정
  const client = new Client({
    // 봇에게 이벤트 권한(intent)을 설정
    intents: [
      GatewayIntentBits.Guilds, // 서버(길드) 정보에 접근
      GatewayIntentBits.GuildMessages, // 서버의 메시지 정보에 접근
    ],
  });

  // 스케줄링 함수 파라미터 타입 정의
  interface ScheduleThreadParams {
    hour: number; // 스레드를 생성할 시간 (0-23)
    text: string; // 스레드 생성 시 보낼 메시지
    threadName: string; // 생성될 스레드의 이름
  }

  // 스케줄러 설정용 함수 (기간 + 요일 + 시간)
  function scheduleThread({ hour, text, threadName }: ScheduleThreadParams) {
    // cron 표현식: '분 시 일 월 요일'
    // '0 ${hour} * * 1-5' → 매주 월요일부터 금요일까지, 지정된 'hour'시 정각에 작업 실행
    cron.schedule(`0 ${hour} * * 1-5`, async () => {
      const now = new Date();
      const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC → KST

      // 기간 체크: 2025-12-05 ~ 2026-01-23
      const start = new Date("2025-12-05T00:00:00+09:00");
      const end = new Date("2026-01-23T23:59:59+09:00");
      if (kst < start || kst > end) return;

      // 환경변수에서 채널 ID를 가져와 채널 객체 검색
      const channel = await client.channels.fetch(resolvedChannelId);
      // 채널이 존재하지 않거나, 텍스트를 보낼 수 있는 채널(TextChannel, NewsChannel 등)이 아니면 종료
      // instanceof를 사용한 type narrowing
      if (
        !channel ||
        !(channel instanceof TextChannel || channel instanceof NewsChannel)
      )
        return console.error("❌ 채널을 찾을 수 없습니다.");

      try {
        // 지정된 채널에 메시지를 전송
        const message = await channel.send(text);
        // 방금 보낸 메시지에 스레드를 생성
        const thread = await message.startThread({
          name: threadName,
          autoArchiveDuration: 60, // 60분 후 자동 아카이브
        });
        console.log(
          `🧵 ${threadName} 스레드 생성 완료! (${kst.toLocaleString("ko-KR")})`
        );
      } catch (err) {
        console.error("❌ 스레드 생성 실패:", err);
      }
    });
  }

  // 봇 준비 이벤트
  // client.once: 'clientReady' 이벤트가 발생했을 때 한 번만 실행될 콜백 함수 등록
  client.once("clientReady", async () => {
    // 봇이 성공적으로 로그인되면, 봇의 유저 태그를 콘솔에 출력
    console.log(`✅ ${client.user!.tag} 로그인 완료!`);

    // 서버 입장 확인
    const guilds = client.guilds.cache.map((g) => g.name);
    console.log("봇이 입장한 서버:", guilds);

    // 매주 월~금 11시, 14시, 17시
    scheduleThread({
      hour: 11,
      text: "@everyone 🕚 오전 11시! 오전 진행상황 점검 시간이에요 💪",
      threadName: "11시 진행상황 스레드",
    });

    scheduleThread({
      hour: 14,
      text: "@everyone 🕑 오후 2시! 점심 이후 진행상황 공유해요 ✨",
      threadName: "14시 진행상황 스레드",
    });

    scheduleThread({
      hour: 17,
      text: "@everyone 🕔 오후 5시! 하루 마무리 점검 시간입니다 🔥",
      threadName: "17시 진행상황 스레드",
    });
  });

  // 로그인
  // .env 파일에 저장된 디스코드 봇 토큰을 사용하여 디스코드에 로그인
  client
    .login(resolvedToken)
    .catch((err) => console.error("❌ 로그인 실패:", err.message));
}
