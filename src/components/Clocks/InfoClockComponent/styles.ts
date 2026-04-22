import styled from "styled-components";

export const InfoComponentsContainer = styled.div`
  padding: 1rem;
  text-align: center;
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
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), 0 25px 70px rgba(0, 0, 0, 0.4),
    inset 0 -8px 20px rgba(0, 0, 0, 0.4),
    inset 0 8px 20px rgba(255, 255, 255, 0.1);
`;

export const TitleContainer = styled.div`
    font-size: 25px;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgb(255, 255, 255);
    opacity: 0.7;
    font-weight: 600;
    letter-spacing: 0.2em;
`