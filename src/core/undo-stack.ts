export interface ExtractSnapshot {
	sourceFilePath: string;
	sourceContentBefore: string;
	/** Paths of files created during extraction — deleted on undo. Empty for append-existing. */
	createdFilePaths: string[];
	/** For append-existing: the target file and its content before appending. */
	targetFilePath?: string;
	targetContentBefore?: string;
}

/** Single-slot, in-memory undo stack for the last extract operation. */
export class UndoStack {
	private last: ExtractSnapshot | null = null;

	push(snapshot: ExtractSnapshot): void {
		this.last = snapshot;
	}

	pop(): ExtractSnapshot | null {
		const s = this.last;
		this.last = null;
		return s;
	}

	has(): boolean {
		return this.last !== null;
	}
}
