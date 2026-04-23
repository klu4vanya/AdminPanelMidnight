import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Howl } from "howler";

import InfoComponent from "../InfoClockComponent";
import {
  BlindsContainer,
  CentralPanelContainer,
  Content,
  ContentContainer,
  CurrentBlindNumber,
  CurrentBlindText,
  DecorativeLine,
  MainContainer,
  MainContentContainer,
  MainTitle,
  NextBlindContainer,
  NextBlindNumber,
  PrizePoolContainer,
  RightPanelContainer,
  RightPanelTitle,
  TimerContainer,
  TimerText,
  TimerWrapper,
  PayoutContainer,
  PayoutWrapper,
  PercentContainer,
  Payouts,
  Places,
} from "./styles";

import { clocksAPI } from "../../../api/ClockApi";
import { participantsAPI, gamesAdminAPI } from "../../../api/adminApi";

import { Game, TimerState } from "../../../types";

const prizePool = 5000;

const formatNumber = (num: number) => num.toLocaleString("ru-RU");

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const payouts = [
  { place: "1 место", percentage: 40 },
  { place: "2 место", percentage: 25 },
  { place: "3 место", percentage: 15 },
  { place: "4 место", percentage: 10 },
  { place: "5 место", percentage: 6 },
  { place: "6 место", percentage: 4 },
];

export default function MainPage() {
  const { id } = useParams<{ id: string }>();

  const [currentGame, setCurrentGame] = useState<Game>();
  const [timer, setTimer] = useState<TimerState>();
  const [levels, setLevels] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);

  // 🔊 звук
  const levelSound = useRef(
    new Howl({
      src: ["/sounds/level-up.mp3"],
      volume: 1,
    })
  );

  // 👇 запоминаем прошлый уровень
  const prevLevelRef = useRef<number | null>(null);

  const loadParticipants = async (gameId: number) => {
    try {
      const res = await participantsAPI.getByGame(gameId);
      setParticipants(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const gameRes = await clocksAPI.getTournament(id);
        const tournament = gameRes.data;

        setCurrentGame(tournament);

        const levelsRes = await clocksAPI.getLevels(id);
        setLevels(levelsRes.data);

        const gamesRes = await gamesAdminAPI.getGames();

        const linkedGame = gamesRes.data.find(
          (g: any) =>
            g.name?.trim().toLowerCase() ===
            tournament.name?.trim().toLowerCase()
        );

        if (!linkedGame) {
          console.warn("Linked game not found");
          return;
        }

        await loadParticipants(linkedGame.game_id);

        const interval = setInterval(() => {
          loadParticipants(linkedGame.game_id);
        }, 5000);

        return () => clearInterval(interval);
      } catch (e) {
        console.error(e);
      }
    };

    const ws = new WebSocket(
      `wss://api.midnight-club-app.ru/clock/tournaments/${id}/timer/ws`
    );

    ws.onmessage = (event) => {
      setTimer(JSON.parse(event.data));
    };

    load();

    return () => ws.close();
  }, [id]);

  // 🔥 ЗВУК ПРИ СМЕНЕ УРОВНЯ
  useEffect(() => {
    if (!timer) return;

    if (prevLevelRef.current !== null && timer.level > prevLevelRef.current) {
      levelSound.current.play();
    }

    prevLevelRef.current = timer.level;
  }, [timer?.level, timer]);

  // ====== CALCULATIONS ======

  const arrivedCount = participants.filter((p) => p.arrived).length;
  const outsCount = participants.filter((p) => p.is_out).length;
  const activePlayers = Math.max(arrivedCount - outsCount, 0);

  const totalRebuys = participants.reduce((sum, p) => {
    const r = Number(p.rebuys || 0);
    return sum + (r > 0 ? r : 0);
  }, 0);

  const test_data = [
    { title: "Игроки", data: `${activePlayers} / ${arrivedCount}` },
    { title: "Реентри", data: `${totalRebuys}` },
    { title: "Уровень", data: timer?.level ?? "-" },
    {
      title: "Средний стек",
      data: activePlayers
        ? `${Math.floor(((activePlayers + totalRebuys) * 40000) / activePlayers)}`
        : 0,
    },
    {
      title: "Фишек в игре",
      data: `${arrivedCount * 40000 + totalRebuys * 40000}`,
    },
  ];

  const next = timer?.next_level;

  const totalTimeToBreak = (() => {
    if (!levels?.length) return 0;

    let sum = 0;

    for (const lvl of levels) {
      if (lvl.small_blind === 0 && lvl.big_blind === 0) break;

      sum += Number(lvl.duration_minutes) || 0;
    }

    return sum;
  })();

  const currentLevelIndex = levels.findIndex(
    (lvl) =>
      lvl.small_blind === timer?.small_blind &&
      lvl.big_blind === timer?.big_blind
  );

  const elapsedMinutes = (() => {
    if (!timer || currentLevelIndex === -1) return 0;

    let sum = 0;

    for (let i = 0; i < currentLevelIndex; i++) {
      const lvl = levels[i];

      if (lvl.small_blind === 0 && lvl.big_blind === 0) break;

      sum += Number(lvl.duration_minutes) || 0;
    }

    const currentLevel = levels[currentLevelIndex];

    if (currentLevel) {
      const total = Number(currentLevel.duration_minutes) || 0;
      const remaining = (timer.remaining_seconds || 0) / 60;

      sum += total - remaining;
    }

    return sum;
  })();

  const minutesToBreakNow = Math.max(
    Math.floor(totalTimeToBreak - elapsedMinutes),
    0
  );

  return (
    <MainContainer>
      <MainTitle>
        <h1 style={{ fontSize: "5rem" }}>{currentGame?.name}</h1>
      </MainTitle>

      <MainContentContainer>
        <ContentContainer>
          {test_data.map((item, index) => (
            <InfoComponent key={index} title={item.title}>
              <Content>{item.data}</Content>
            </InfoComponent>
          ))}
        </ContentContainer>

        <CentralPanelContainer>
          <TimerContainer>
            <TimerWrapper>
              <TimerText>
                {timer ? formatTime(timer.remaining_seconds) : "00:00"}
              </TimerText>
            </TimerWrapper>
          </TimerContainer>

          <BlindsContainer>
            <DecorativeLine />
            <CurrentBlindText>Текущие блайнды</CurrentBlindText>
            <CurrentBlindNumber>
              {timer ? `${timer.small_blind} / ${timer.big_blind}` : "00/00"}
            </CurrentBlindNumber>
            <DecorativeLine />
          </BlindsContainer>

          <NextBlindContainer>
            <CurrentBlindText style={{ opacity: 0.5 }}>
              Следующий уровень
            </CurrentBlindText>

            <NextBlindNumber>
              {next
                ? next.type === "level"
                  ? `${next.small_blind}/${next.big_blind}`
                  : `Перерыв (${next.duration_minutes} мин)`
                : "—"}
            </NextBlindNumber>
          </NextBlindContainer>

          <NextBlindContainer>
            <CurrentBlindText style={{ opacity: 0.5 }}>
              До перерыва
            </CurrentBlindText>

            <NextBlindNumber>{minutesToBreakNow} мин</NextBlindNumber>
          </NextBlindContainer>
        </CentralPanelContainer>

        <RightPanelContainer>
          <InfoComponent title="Всего очков">
            <RightPanelTitle>500 очков</RightPanelTitle>
          </InfoComponent>

          <PrizePoolContainer>
            <CurrentBlindText>Распределение очков</CurrentBlindText>

            <PayoutContainer>
              {payouts.map((p, i) => (
                <PayoutWrapper key={i}>
                  <Places>{p.place}</Places>

                  <div style={{ textAlign: "right" }}>
                    <PercentContainer>{p.percentage}%</PercentContainer>

                    <Payouts>
                      {formatNumber(
                        Math.floor((prizePool * p.percentage) / 100)
                      )}
                    </Payouts>
                  </div>
                </PayoutWrapper>
              ))}
            </PayoutContainer>
          </PrizePoolContainer>
        </RightPanelContainer>
      </MainContentContainer>
    </MainContainer>
  );
}
