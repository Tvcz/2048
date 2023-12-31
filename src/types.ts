export type SerializedGameState = {
  grid: SerializedGrid;
  score: number;
  over: boolean;
  won: boolean;
  shouldKeepPlaying: boolean;
};

export type SerializedGrid = {
  tiles: SerializedTile[];
  size: number;
};

export type SerializedTile = {
  position: {
    x: number;
    y: number;
  };
  value: number;
};
