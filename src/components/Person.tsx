import { css } from 'astroturf';
import { cn } from '../helpers';
import IconButton from './IconButton';
import ConfirmDelete from './ConfirmDelete';
import { Lock, Trash, Unlock } from 'react-feather';
import * as personActions from '../actions/person';
import * as teamActions from '../actions/team';
import { useModal } from '../hooks/useModal';
import { useAdditionalUserInfo } from '../hooks/useAdditionalUserInfo';
import { DragEvent } from 'react';

interface Props {
  userId: string;
  displayName: string;
  photoURL: string;
  teamId: string;
  isLocked?: boolean;
  draggable: boolean;
  editable?: boolean;
  contextCount: number;
}

export default function Person(props: Props) {
  const { displayName, teamId, isLocked, userId, contextCount } = props;
  const { identiconString } = useAdditionalUserInfo(userId);
  const [, setModalContent] = useModal();

  const name = displayName || '(no display name)';

  function toggleLocked() {
    if (isLocked) {
      personActions.unlockPerson(teamId, userId);
    } else {
      personActions.lockPerson(teamId, userId);
    }
  }

  function removeMember() {
    setModalContent(
      <ConfirmDelete
        action={`remove ${displayName || 'this user'} from this team`}
        deletingText="Removing..."
        onConfirm={() => teamActions.removeTeamMember(teamId, userId)}
      />
    );
  }

  function onDragStart(evt: DragEvent<HTMLDivElement>) {
    if (isLocked) return;
    evt.dataTransfer.setData('entityType', 'person');
    evt.dataTransfer.setData('entityId', props.userId);
  }

  return (
    <div
      className={cn(styles.person, styles["contextCount" + Math.min(contextCount, 3)])}
      draggable={props.draggable && !isLocked}
      onDragStart={onDragStart}
    >
      <div className={styles.photo}>
        {props.photoURL ? (
          <img className={styles.img} src={props.photoURL} alt={name} draggable={false} />
        ) : (
          <svg className={styles.img} width="80" height="80"
            data-jdenticon-value={identiconString ? identiconString : props.userId} />
        )}
      </div>

      <div className={styles.name}>{name}</div>

        <div className={styles.buttons}>
          <IconButton
            icon={isLocked ? <Lock /> : <Unlock />}
            label={isLocked ? 'Unlock person' : 'Lock person'}
            onClick={toggleLocked}
            dark={isLocked}
          />
        {props.editable && (
          <IconButton icon={<Trash />} label="Remove person from team" onClick={removeMember} />
        )}
        </div>
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .contextCount0 {
    transform: scale(1.1);
    box-shadow: 0px 24px 15px -15px rgba(0,0,0,0.4);
  }
  .contextCount1 {
    box-shadow: 0px 16px 10px -6px rgba(0,0,0,0.4);
  }
  .contextCount2 {
    transform: scale(0.95);
    box-shadow: 0px 8px 5px -3px rgba(0,0,0,0.4);
  }
  .contextCount3 {
    transform: scale(0.9);
  }

  .person {
    background: var(--color-theme);
    border: 1px solid var(--color-border);
    display: inline-flex;
    color: inherit;
    transition: background 0.1s ease-in-out;
    border-radius: $unit-half;
    font-size: inherit;
    align-items: center;
    margin: $unit;
    user-select: none;

    &[draggable='true'] {
      cursor: move;
    }
  }

  .photo {
    height: 3em;

    svg {
      stroke: none;
    }
  }

  .img {
    width: 3em;
    height: 3em;
    border-radius: $unit-half;
  }

  .name {
    padding: 0 $unit;
  }

  .buttons {
    margin-right: $unit-half;
  }
`;
