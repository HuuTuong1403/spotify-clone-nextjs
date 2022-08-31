import { usePlaylistContext } from "../contexts/PlaylistContext";
import { Song } from "./Song";

export const Songs = () => {
  const {
    playlistContextState: { selectedPlaylist },
  } = usePlaylistContext();

  if (!selectedPlaylist) return null;

  return (
    <div className="flex flex-col space-y-1 px-8 pb-28">
      {selectedPlaylist.tracks.items.map(({ track }, index) => (
        <Song key={track?.id} item={track} itemIndex={index} />
      ))}
    </div>
  );
};
