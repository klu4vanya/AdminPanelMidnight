import { InfoCardProps } from "../../../types";
import React from "react";
import { InfoComponentsContainer, TitleContainer } from "./styles";

export default function InfoComponent({ title, children }: InfoCardProps) {
  return (
    <InfoComponentsContainer>
      <TitleContainer>{title}</TitleContainer>
      <div style={{ color: "rgb(255, 255, 255)" }}>{children}</div>
    </InfoComponentsContainer>
  );
}
