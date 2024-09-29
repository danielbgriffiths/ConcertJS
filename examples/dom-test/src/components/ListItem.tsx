import { ConcertLog } from "@concertjs/core";

interface Props {
  item: string;
  onDelete: (item: string) => void;
}

@ConcertLog
export class ListItem {
  static render(props: Props) {
    return (
      <li class="todo-item">
        {props.item}
        <span onClick={() => props.onDelete(props.item)}>X</span>
      </li>
    );
  }
}
