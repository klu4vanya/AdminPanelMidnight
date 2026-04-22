import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import InfoComponent from "../InfoClockComponent";
import logo from "../../../assets/logo.jpg";
import {
  BlindsContainer,
  CentralPanelContainer,
  Content,
  ContentContainer,
  CurrentBlindNumber,
  CurrentBlindText,
  DecorativeLine,
  EdgeBottomLeft,
  EdgeBottomRight,
  EdgeTopLeft,
  EdgeTopRight,
  LogoContainer,
  LogoWrapper,
  MainContainer,
  MainContentContainer,
  MainTitle,
  NextBlindContainer,
  NextBlindNumber,
  PayoutContainer,
  Payouts,
  PayoutWrapper,
  PercentContainer,
  Places,
  PrizePoolContainer,
  RightPanelContainer,
  RightPanelTitle,
  TimerContainer,
  TimerText,
  TimerWrapper,
} from "./styles";
import { clocksAPI } from "../../../api/ClockApi";
import { Game } from "../../../types";

const payouts = [
  { place: "1 место", percentage: 40 },
  { place: "2 место", percentage: 25 },
  { place: "3 место", percentage: 15 },
  { place: "4 место", percentage: 10 },
  { place: "5 место", percentage: 6 },
  { place: "6 место", percentage: 4 },
];

const prizePool = 5000;


const formatNumber = (num: number) => {
  return num.toLocaleString("ru-RU");
};

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function MainPage() {
  const { id } = useParams<{ id: string }>();
  const [currentGame, setCurrentGame] =  useState<Game>()
  const [timer, setTimer] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const loadGame = async () => {
      try {
        const response = await clocksAPI.getTournament(id);
        setCurrentGame(response.data);
      } catch (err: any) {
        console.error("Error fetching game:", err);
      }
    };

    const ws = new WebSocket(
      `wss://api.midnight-club-app.ru/clock/tournaments/${id}/timer/ws`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTimer(data);
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
    };
    loadGame()
    return () => ws.close();
    
  }, [id]);
  const amountPlayers = 1
  const reentries = 1
  
  const test_data = [
    {
      title: "Игроки",
      data: `${amountPlayers}`,
    },
    {
      title: "Уровень",
      data: timer?.level ?? "-",
    },
    {
      title: "Средний стек",
      data: `${amountPlayers * 30000 / reentries}`,
    },
    {
      title: "Фишек в игре",
      data: `${amountPlayers * 30000}`,
    },
    {
      title: "До перерыва",
      data: "—",
    },
  ];

  return (
    <MainContainer>
      <MainTitle>
        <h1>Турнир {currentGame?.name}</h1>
      </MainTitle>

      <MainContentContainer>
        {/* LEFT */}
        <ContentContainer>
          {test_data.map((item, index) => (
            <InfoComponent key={index} title={item.title}>
              <Content>{item.data}</Content>
            </InfoComponent>
          ))}
        </ContentContainer>

        {/* CENTER */}
        <CentralPanelContainer>
          <LogoContainer>
            <LogoWrapper>
              <img
                src={logo}
                alt="Poker Logo"
                style={{ width: "auto", height: "10rem" }}
              />
            </LogoWrapper>
            <EdgeTopLeft />
            <EdgeTopRight />
            <EdgeBottomLeft />
            <EdgeBottomRight />
          </LogoContainer>

          {/* TIMER */}
          <TimerContainer>
            <TimerWrapper>
              <TimerText>
                {timer
                  ? formatTime(timer.remaining_seconds)
                  : "00:00"}
              </TimerText>
            </TimerWrapper>
            <EdgeTopLeft style={{ width: "30px", height: "30px" }} />
            <EdgeTopRight style={{ width: "30px", height: "30px" }} />
            <EdgeBottomLeft style={{ width: "30px", height: "30px" }} />
            <EdgeBottomRight style={{ width: "30px", height: "30px" }} />
          </TimerContainer>

          {/* CURRENT BLINDS */}
          <BlindsContainer>
            <DecorativeLine />
            <CurrentBlindText>Текущие блайнды</CurrentBlindText>
            <CurrentBlindNumber>
              {timer
                ? `${timer.small_blind}/${timer.big_blind}`
                : "0/0"}
            </CurrentBlindNumber>
            <DecorativeLine />
          </BlindsContainer>

          {/* NEXT LEVEL */}
          <NextBlindContainer>
            <CurrentBlindText
              style={{
                marginBottom: "0.5rem",
                opacity: "0.5",
                fontWeight: "600",
              }}
            >
              Следующий уровень
            </CurrentBlindText>
            <NextBlindNumber>
            {timer?.next_level ? timer.next_level.small_blind / timer.next_level.big_blind : "—"}
            </NextBlindNumber>
          </NextBlindContainer>
        </CentralPanelContainer>

        {/* RIGHT */}
        <RightPanelContainer>
          <InfoComponent title="Всего очков">
            <RightPanelTitle>500 очков</RightPanelTitle>
          </InfoComponent>

          <PrizePoolContainer>
            <CurrentBlindText>Распределение очков</CurrentBlindText>

            <PayoutContainer>
              {payouts.map((payout, index) => (
                <PayoutWrapper key={index}>
                  <Places>{payout.place}</Places>

                  <div style={{ textAlign: "right" }}>
                    <PercentContainer>
                      {payout.percentage}%
                    </PercentContainer>

                    <Payouts>
                      {formatNumber(
                        Math.floor(
                          (prizePool * payout.percentage) / 100
                        )
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