import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

export const wp = (value: number) => responsiveWidth(value);
export const hp = (value: number) => responsiveHeight(value);
export const fs = (value: number) => responsiveFontSize(value);
