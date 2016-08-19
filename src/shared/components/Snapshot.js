// @flow

type CaseType = {
  name: string,
  action?: () => void,
}

type Props = {
  children?: any,
  component?: ReactClass,
  name?: string,
  action?: () => void,
  cases?: CaseType[],
};

export default function Snapshot() {
  return null;
}
