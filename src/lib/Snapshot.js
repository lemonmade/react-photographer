// @flow

type CaseType = {
  name: string,
  action?: () => void,
}

type ViewportType = {
  height: number,
  width: number,
};

type Props = {
  children?: any,
  component?: ReactClass,
  name?: string,
  record?: boolean,
  skip?: boolean,
  exclusive?: boolean,
  viewports?: ViewportType[],
  action?: () => void,
  cases?: CaseType[],
};

export default function Snapshot() {
  return null;
}
