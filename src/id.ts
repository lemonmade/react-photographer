export type ID = string;

interface IDAble {
  id?: ID,
  name: string,
  case?: string | null,
  parent: IDAble | null,
}

export default function getID({id, name, case: aCase, parent}: IDAble): ID {
  if (id != null) { return id; }

  const caseString = aCase ? `:${aCase}` : '';
  return parent ? `${getID(parent)}-${name}${caseString}` : `${name}${caseString}`;
}
