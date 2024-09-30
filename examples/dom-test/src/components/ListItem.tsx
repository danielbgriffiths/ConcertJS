import { ConcertLog, signal } from "@concertjs/core";

interface Props {
  item: string;
  onDelete: (item: string) => void;
  onUpdate: (oldItem: string, newItem: string) => void;
}

@ConcertLog
export class ListItem {
  static render(props: Props) {
    let inputRef!: HTMLInputElement | undefined;

    const [isEditing, setIsEditing] = signal(false);

    function onEdit() {
      setIsEditing(true);
    }

    function onSave() {
      if (!inputRef) return;
      props.onUpdate(props.item, inputRef.value);
      setIsEditing(false);
    }

    function onCancel() {
      setIsEditing(false);
    }

    return (
      <li class="todo-item">
        {isEditing() ? (
          <input ref={ref => (inputRef = ref)} defaultValue={props.item} />
        ) : (
          props.item
        )}
        <span onClick={() => props.onDelete(props.item)}>X</span>
        {isEditing() ? (
          <div>
            <button type="button" onClick={onSave}>
              SAVE
            </button>
            <button type="button" onClick={onCancel}>
              CANCEL
            </button>
          </div>
        ) : (
          <button type="button" onClick={onEdit}>
            EDIT
          </button>
        )}
      </li>
    );
  }
}
