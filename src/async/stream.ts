// Copyright 2016 Joe Duffy. All rights reserved.

'use strict';

/** An asynchronous stream of values. */
export interface IStream<T> {
    subscribe(observer: IStreamObserver<T>): Promise<IStreamSubscription>;
}

/** An observer of an asynchronous stream of values. */
export interface IStreamObserver<T> {
    onNext?: ((value: T) => Promise<void>) | undefined;
    onError?: ((err: Error) => Promise<void>) | undefined;
    onComplete?: (() => Promise<void>) | undefined;
}

/** A subscription object representing a single observer subscription. */
export interface IStreamSubscription {
    cancel(): Promise<void>;
}

