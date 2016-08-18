// @flow

type CaseType = {
  name: string,
  action?: () => void,
}

type Props = {
  children?: any,
  cases: CaseType[],
};

export default function SnapshotGroup(props: Props) {
  return null;
}
