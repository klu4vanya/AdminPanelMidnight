import styled from "styled-components";

export const MainContainer = styled.div`
  max-height: 100%;
  background-color: #000;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  font-family: "Montserrat", sans-serif;
`;

export const MainTitle = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;

  h1 {
    font-size: 3rem;
    line-height: 1;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgb(255, 255, 255);
  }
`;
//Левая панель
export const MainContentContainer = styled.div`
  flex: 1 1 0%;
  display: grid;
  grid-template-columns: 0.5fr 1fr 0.5fr;
  gap: 2rem;
  margin-top: 2.5%;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;
export const Content = styled.div`
  font-size: 2.6rem;
  font-weight: 600;
`;
// Центральная панель

export const CentralPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
`;
export const LogoContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

export const LogoWrapper = styled.div`
  width: 20rem;
  height: 12rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-color: rgb(76, 77, 82);
  clip-path: polygon(
    10% 0%,
    90% 0%,
    100% 10%,
    100% 90%,
    90% 100%,
    10% 100%,
    0% 90%,
    0% 10%
  );
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), 0 25px 70px rgba(0, 0, 0, 0.4),
    inset 0 -8px 20px rgba(0, 0, 0, 0.4),
    inset 0 8px 20px rgba(255, 255, 255, 0.1);
`;

export const EdgeTopLeft = styled.div`
  position: absolute;
  top: -0.25rem;
  left: -0.25rem;
  width: 20px;
  height: 20px;
  border-top: 3px solid white;
  border-left: 3px solid white;
`;

export const EdgeTopRight = styled.div`
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 20px;
  height: 20px;
  border-top: 3px solid white;
  border-right: 3px solid white;
`;

export const EdgeBottomLeft = styled.div`
  position: absolute;
  bottom: -0.25rem;
  left: -0.25rem;
  width: 20px;
  height: 20px;
  border-bottom: 3px solid white;
  border-left: 3px solid white;
`;

export const EdgeBottomRight = styled.div`
  position: absolute;
  bottom: -0.25rem;
  right: -0.25rem;
  width: 20px;
  height: 20px;
  border-bottom: 3px solid white;
  border-right: 3px solid white;
`;

export const TimerContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const TimerWrapper = styled.div`
  text-align: center;
  padding-left: 4rem;
  padding-right: 2rem;
  background-color: rgb(20, 20, 25);
  border: 4px solid rgb(76, 77, 82);
  clip-path: polygon(
    3% 0%,
    97% 0%,
    100% 3%,
    100% 97%,
    97% 100%,
    3% 100%,
    0% 97%,
    0% 3%
  );
  box-shadow: 0 20px 60px rgba(76, 77, 82, 0.7),
    0 30px 90px rgba(76, 77, 82, 0.4), inset 0 -10px 25px rgba(0, 0, 0, 0.5),
    inset 0 10px 25px rgba(255, 255, 255, 0.05);
`;

export const TimerText = styled.div`
  font-size: 12rem;
  line-height: 1;
  color: rgb(255, 255, 255);
  font-family: "Montserrat", sans-serif;
  font-weight: 900;
  letter-spacing: 0.05rem;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.4), 0 8px 15px rgba(0, 0, 0, 0.7);
`;
export const BlindsContainer = styled.div`
  width: stretch;
  padding: 2rem;
  text-align: center;
  position: relative;
  background-color: rgb(76, 77, 82);
  clip-path: polygon(
    2% 0%,
    98% 0%,
    100% 2%,
    100% 98%,
    98% 100%,
    2% 100%,
    0% 98%,
    0% 2%
  );
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 30px 80px rgba(0, 0, 0, 0.4),
    inset 0 -10px 25px rgba(0, 0, 0, 0.4),
    inset 0 10px 25px rgba(255, 255, 255, 0.1);
`;

export const DecorativeLine = styled.div`
  position: absolute;
  top: 0;
  left: 0.125rem;
  transform: translateX(-50%);
  width: 80%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
`;

export const CurrentBlindText = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgb(255, 255, 255);
  opacity: 0.7;
  font-weight: 600;
`;
export const CurrentBlindNumber = styled.div`
  font-size: 4.5rem;
  line-height: 1;
  margin-bottom: 0.5rem;
  color: rgb(255, 255, 255);
  font-weight: 800;
`;
export const NextBlindContainer = styled.div`
  width: stretch;
  padding: 1.5rem;
  text-align: center;
  background-color: rgb(10, 10, 10);
  border: 2px solid rgb(76, 77, 82);
  clip-path: polygon(
    2% 0%,
    98% 0%,
    100% 2%,
    100% 98%,
    98% 100%,
    2% 100%,
    0% 98%,
    0% 2%
  );
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5),
    inset 0 -5px 15px rgba(0, 0, 0, 0.4),
    inset 0 5px 15px rgba(255, 255, 255, 0.03);
`;

export const NextBlindNumber = styled.div`
  font-size: 3rem;
  color: rgb(255, 255, 255);
  opacity: 0.7;
  font-weight: 700;
`;
export const RightPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;
export const RightPanelTitle = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  font-weight: 800;
`;
export const PrizePoolContainer = styled.div`
  padding: 1.5rem;
  background-color: rgb(76, 77, 82);
  clip-path: polygon(
    2% 0%,
    98% 0%,
    100% 2%,
    100% 98%,
    98% 100%,
    2% 100%,
    0% 98%,
    0% 2%
  );
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 30px 80px rgba(0, 0, 0, 0.4),
    inset 0 -10px 25px rgba(0, 0, 0, 0.4),
    inset 0 10px 25px rgba(255, 255, 255, 0.1);
`;

export const PayoutContainer = styled.div`
    margin-top: 0.75rem
`

export const PayoutWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.75rem;
    position: relative;
`

export const Places = styled.span`
    font-size: 1.125rem;
    line-height: 1.75rem;
    padding-left: 0.75rem;
    color: rgb(255, 255, 255);
    font-weight: 600;
`

export const PercentContainer = styled.div`
    font-size: 1.25rem;
    color: rgb(255, 255, 255);
    font-weight: 700;
`
export const Payouts = styled.div`
    font-size: 0.85rem;
    color: rgb(255, 255, 255);
    opacity: 0.6;
    font-weight: 500;
`