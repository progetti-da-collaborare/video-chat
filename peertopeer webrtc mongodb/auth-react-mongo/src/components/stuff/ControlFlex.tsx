import styled from "styled-components"

const ControlFlex = styled.div<{isVertical?:boolean}>`
  display: flex;
  flex-direction: ${(p) => p.isVertical ? "column" : "row"};
  row-gap: 15px;
  column-gap: 15px;
  position: static;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin: 10px;`

export default ControlFlex