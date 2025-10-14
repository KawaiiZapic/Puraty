const mapConvertor = <T>(input: T): Record<string, never> => {
	if (input instanceof Map) {
		const r: Record<string, T> = {};
		input.forEach((v, k) => {
			r[k] = v;
		});
		return r as Record<string, never>;
	}
	return input as Record<string, never>;
};

export class Comic {
	public id: string;
	public title: string;
	public subtitle: string;
	public subTitle: string;
	public cover: string;
	public tags: string[];
	public description: string;
	public maxPage?: number;
	public language?: string;
	public favoriteId?: string;
	public stars?: number;
	constructor({
		id,
		title,
		subtitle,
		subTitle,
		cover,
		tags,
		description,
		maxPage,
		language,
		favoriteId,
		stars
	}: Comic) {
		this.id = id;
		this.title = title;
		this.subtitle = subtitle;
		this.subTitle = subTitle;
		this.cover = cover;
		this.tags = tags;
		this.description = description;
		this.maxPage = maxPage;
		this.language = language;
		this.favoriteId = favoriteId;
		this.stars = stars;
	}
}

export class ComicDetails {
	public title: string;
	public subtitle?: string;
	public subTitle?: string;
	public cover: string;
	public description?: string;
	public tags?: Record<string, string[]>;
	public chapters?: Record<string, string>;
	public isFavorite?: boolean;
	public subId?: string;
	public thumbnails?: string[];
	public recommend?: Comic[];
	public commentCount?: number;
	public likesCount?: number;
	public isLiked?: boolean;
	public uploader?: string;
	public updateTime?: string;
	public uploadTime?: string;
	public url?: string;
	public stars?: number;
	public maxPage?: number;
	public comments?: Comment[];

	constructor({
		title,
		subtitle,
		subTitle,
		cover,
		description,
		tags,
		chapters,
		isFavorite,
		subId,
		thumbnails,
		recommend,
		commentCount,
		likesCount,
		isLiked,
		uploader,
		updateTime,
		uploadTime,
		url,
		stars,
		maxPage,
		comments
	}: ComicDetails) {
		this.title = title;
		this.subtitle = subtitle ?? subTitle;
		this.cover = cover;
		this.description = description;
		this.tags = mapConvertor(tags);
		this.chapters = mapConvertor(chapters);
		this.isFavorite = isFavorite;
		this.subId = subId;
		this.thumbnails = thumbnails;
		this.recommend = recommend;
		this.commentCount = commentCount;
		this.likesCount = likesCount;
		this.isLiked = isLiked;
		this.uploader = uploader;
		this.updateTime = updateTime;
		this.uploadTime = uploadTime;
		this.url = url;
		this.stars = stars;
		this.maxPage = maxPage;
		this.comments = comments;
	}
}

export class Comment {
	public userName: string;
	public avatar?: string;
	public content?: string;
	public time?: string;
	public replyCount?: number;
	public id?: string;
	public isLiked?: boolean;
	public score?: number;
	public voteStatus?: number;

	constructor({
		userName,
		avatar,
		content,
		time,
		replyCount,
		id,
		isLiked,
		score,
		voteStatus
	}: Comment) {
		this.userName = userName;
		this.avatar = avatar;
		this.content = content;
		this.time = time;
		this.replyCount = replyCount;
		this.id = id;
		this.isLiked = isLiked;
		this.score = score;
		this.voteStatus = voteStatus;
	}
}

export class ImageLoadingConfig {
	public url?: string;
	public method?: string;
	public data: unknown;
	public headers: Record<string, string>;
	public onResponse?: (source: ArrayBuffer) => ArrayBuffer;
	public modifyImage?: string;
	public onLoadFailed?: () => ImageLoadingConfig;

	constructor({
		url,
		method,
		data,
		headers,
		onResponse,
		modifyImage,
		onLoadFailed
	}: ImageLoadingConfig) {
		this.url = url;
		this.method = method;
		this.data = data;
		this.headers = headers;
		this.onResponse = onResponse;
		this.modifyImage = modifyImage;
		this.onLoadFailed = onLoadFailed;
	}
}
