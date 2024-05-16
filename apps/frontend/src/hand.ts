import { Color, Group, Path, Point, Rectangle } from 'paper/dist/paper-core';
import { Power2 } from 'gsap';
import { Card } from '~/src/card';
import type { DiscardPile } from '~/src/discardPile';
import _ from 'lodash';

// 手牌
export class Hand extends Group {
    cards: Card[] = [];
    private drawingAnimators: DrawingAnimator[] = [];
    private playingAnimators: PlayingAnimator[] = [];

    constructor() {
        super();
        
        this.applyMatrix = false;

        const border = new Path.Rectangle(new Rectangle(0, 0, 600, 200));
        border.strokeColor = new Color(1, 0, 0);
        this.addChild(border);

        this.onFrame = this.frame;
    }

    // 抽牌
    drawCard = async (hand: Hand, idxs: number[]) => new Promise((resolve, reject) => {
        const animator = new DrawingAnimator(hand, this, idxs);
        
        animator.onAnimated = () => {
            _.remove(this.drawingAnimators, (v) => v == animator);
            return resolve(true);
        };

        this.drawingAnimators.push(animator);
    });

    // 出牌至棄牌堆
    play = async (discardPile: DiscardPile, idxs: number[]) => new Promise((resolve, reject) => {
        const animator = new PlayingAnimator(discardPile, this, idxs);
        
        animator.onAnimated = () => {
            _.remove(this.playingAnimators, (v) => v == animator);
            return resolve(true);
        };

        this.playingAnimators.push(animator);
    });

    private frame = () => {
        _.each(this.drawingAnimators, (v) => {
            v?.moveNext();
        });
        _.each(this.playingAnimators, (v) => {
            v?.moveNext();
        });
    }
}

class DrawingAnimator {
    private fromHand: Hand;
    private toHand: Hand;
    private cards: Card[];
    private currentFromStep: number;
    private fromSteps: number[];
    private currentToStep: number;
    private toSteps: number[];
    private checkPoint: paper.Point;
    private tempCheckPoint?: paper.Point;
    private diffFromVectorConfigs: DiffConfig[];
    private diffReserveFromVectorConfigs: DiffConfig[];
    private diffToVectorConfigs: DiffConfig[];
    private diffReserveToVectorConfigs: DiffConfig[];
    private options: DrawingOptions;

    onAnimated?: () => void;

    constructor(fromHand: Hand, toHand: Hand, idx: number[], options?: Partial<DrawingOptions>) {
        this.fromHand = fromHand;
        this.toHand = toHand;
        this.cards = this.fromHand.cards?.filter((v, i) => Array.from(new Set(idx)).includes(i));
        this.checkPoint = this.toHand.localToGlobal(this.toHand.bounds.center.subtract(this.toHand.bounds.point));
        this.diffFromVectorConfigs = [];
        this.diffReserveFromVectorConfigs = [];
        this.diffToVectorConfigs = [];
        this.diffReserveToVectorConfigs = [];
        this.options = _.defaults(options, { time: 3 });
        this.currentFromStep = 0;
        this.fromSteps = [];
        this.currentToStep = 0;
        this.toSteps = [];

        this.cards.forEach((v) => {
            // v.clipped = false;
        });
    }

    moveNext = () => {
        if (this.currentToStep == this.toSteps.length - 1) {
            return;
        }

        if (!this.tempCheckPoint || !this.checkPoint.subtract(this.tempCheckPoint).ceil().equals([0, 0])) {
            this.calcSteps();
            this.calcDiffVector();

            this.tempCheckPoint = this.checkPoint;
            this.checkPoint = this.toHand.localToGlobal(this.toHand.bounds.center.subtract(this.toHand.bounds.point));
            this.toHand.insertBelow(this.fromHand);
        }

        if (this.currentFromStep < this.fromSteps.length - 1) {
            const diff = this.fromSteps[this.currentFromStep + 1] - this.fromSteps[this.currentFromStep];

            this.diffFromVectorConfigs.forEach((v) => {
                const r = v?.toPoint.subtract(v.fromPoint).rotate(-this.fromHand.rotation, [0, 0]);
                
                v.card.position = v.card.position.add(r?.multiply(diff));
                v.card.rotate(-this.fromHand.rotation * diff);
            });

            this.diffReserveFromVectorConfigs.forEach((v) => {
                const r = v?.toPoint.subtract(v.fromPoint);
                
                v.card.position = v.card.position.add([r?.multiply(diff).x!, 0]);
            });

            this.currentFromStep += 1;
        }
        else if (this.currentToStep < this.toSteps.length - 1) {
            const diff = this.toSteps[this.currentToStep + 1] - this.toSteps[this.currentToStep];

            this.diffReserveToVectorConfigs.forEach((v) => {
                const r = v?.toPoint.subtract(v.fromPoint);
                
                v.card.position = v.card.position.add([r?.multiply(diff).x!, 0]);
            });

            this.diffToVectorConfigs.forEach((v) => {
                const r = v?.toPoint.subtract(v.fromPoint).rotate(-this.fromHand.rotation, [0, 0]);
            
                v.card.position = v.card.position.add(r?.multiply(diff));
                v.card.rotate(this.toHand.rotation * diff);
            });

            this.currentToStep += 1;

            if (this.currentToStep == this.toSteps.length - 1) {
                this.diffToVectorConfigs.forEach((c) => {
                    c.card.rotate(this.fromHand.rotation - this.toHand.rotation);
                    c.card.position = this.toHand.globalToLocal(c.toPoint);
                    this.fromHand.cards.splice(this.fromHand.cards.findIndex((v) => v == c.card), 1);
                    this.toHand.cards.push(c.card);
                    
                    this.toHand.addChild(c.card);
                    // c.card.clipped = true;
                });

                this.onAnimated?.();
            }
        }
    }

    private calcSteps = () => {
        const totalFromSteps = Math.round((this.options?.time! / 2) * 1000 / 16.66);
        const diffFromSteps = totalFromSteps - (this.currentFromStep ?? 0);
        const totalToSteps = Math.round((this.options?.time! / 2) * 1000 / 16.66);
        const diffToSteps = totalToSteps - (this.currentToStep ?? 0);

        this.fromSteps = [];
        this.currentFromStep = 0;
        this.toSteps = [];
        this.currentToStep = 0;
        
        for (let i = 0; i <= diffFromSteps; i++) {            
            let progress = i / diffFromSteps;
            let easedProgress = Power2.easeInOut(progress);
            this.fromSteps.push(easedProgress);
        }

        for (let i = 0; i <= diffToSteps; i++) {            
            let progress = i / diffToSteps;
            let easedProgress = Power2.easeInOut(progress);
            this.toSteps.push(easedProgress);
        }
    }

    private calcDiffVector = () => {
        this.diffFromVectorConfigs = [];
        this.diffReserveFromVectorConfigs = [];
        this.diffToVectorConfigs = [];

        this.cards.forEach((v, i) => {
            const config = {
                card: v,
                fromPoint: v.localToGlobal(v.bounds.center.subtract(v.bounds.point)),
                toPoint: i == 0 ? v.project.activeLayer.bounds.center : this.diffFromVectorConfigs[i - 1].toPoint.add([15, 0]),
            };

            this.diffFromVectorConfigs.forEach((v) => {
                v.toPoint = v.toPoint.add([-15, 0]);
            });

            this.diffFromVectorConfigs.push(config);
        });

        const reserveFromCards = this.fromHand.cards?.filter((v) => !this.cards.includes(v));
        reserveFromCards?.forEach((v, i) => {
            const config = {
                card: v,
                fromPoint: v.bounds.center,
                toPoint: i == 0 ? this.fromHand.globalToLocal(this.fromHand.bounds.center) : this.diffReserveFromVectorConfigs[i - 1].toPoint.add([15, 0]),
            };

            this.diffReserveFromVectorConfigs.forEach((v) => {
                v.toPoint = v.toPoint.add([-15, 0]);
            });

            this.diffReserveFromVectorConfigs.push(config);
        });

        const toCards = [...this.toHand.cards];
        toCards?.forEach((v, i) => {
            const config = {
                card: v,
                fromPoint: v.bounds.center,
                toPoint: i == 0 ? this.toHand.globalToLocal(this.toHand.bounds.center) : this.diffReserveToVectorConfigs[i - 1].toPoint.add([15, 0]),
            };

            this.diffReserveToVectorConfigs.forEach((v) => {
                v.toPoint = v.toPoint.add([-15, 0]);
            });

            this.diffReserveToVectorConfigs.push(config);
        });
        this.diffReserveToVectorConfigs.forEach((v) => {
            v.toPoint = v.toPoint.add([-15 * this.diffFromVectorConfigs.length, 0]);
        });

        this.diffFromVectorConfigs.map((v) => v.card).forEach((v, i) => {
            const config = {
                card: v,
                fromPoint: i == 0 ? v.project.activeLayer.bounds.center : this.diffToVectorConfigs[i - 1].fromPoint.add([15, 0]),
                toPoint: this.diffReserveToVectorConfigs.length == 0 ? this.toHand.bounds.center : this.toHand.localToGlobal(this.diffReserveToVectorConfigs.slice(-1)[0].toPoint.add([30 * (i + 1), 0])),
            };

            this.diffToVectorConfigs.forEach((v) => {
                v.fromPoint = v.fromPoint.add([-15, 0]);
            });

            this.diffToVectorConfigs.push(config);
        })
    }
}

class PlayingAnimator {
    private discardPile: DiscardPile;
    private hand: Hand;
    private cards: Card[];
    private currentStep: number;
    private steps: number[];
    private checkPoint: paper.Point;
    private tempCheckPoint?: paper.Point;
    private diffConfigs: DiffConfig[];
    private diffReserveVectorConfigs: DiffConfig[];
    private options: PlayingOptions;

    onAnimated?: () => void;

    constructor(discardPile: DiscardPile, hand: Hand, idxs: number[], options?: Partial<PlayingOptions>) {
        this.discardPile = discardPile;
        this.hand = hand;
        this.cards = hand.cards.filter((v, i) => idxs.includes(i));
        this.checkPoint = this.discardPile.localToGlobal(this.discardPile.bounds.center.subtract(this.discardPile.bounds.point));
        this.diffConfigs = [];
        this.diffReserveVectorConfigs = [];
        this.currentStep = 0;
        this.steps = [];
        this.options = _.defaults(options, { time: 1, rotate: 20, offset: _.random(-20, 20) });

        this.cards.forEach((v) => {
            // this.discardPile.insertBelow(v);
        });
    }

    moveNext = () => {
        if (this.currentStep == this.steps.length - 1) {
            return;
        }

        if (!this.tempCheckPoint || !this.checkPoint.subtract(this.tempCheckPoint).ceil().equals([0, 0])) {
            this.calcSteps();
            this.calcDiffVector();

            this.tempCheckPoint = this.checkPoint;
            this.checkPoint = this.discardPile.localToGlobal(this.discardPile.bounds.center.subtract(this.discardPile.bounds.point));
        }

        const diff = this.steps[this.currentStep + 1] - this.steps[this.currentStep];

        this.diffConfigs.forEach((v, i) => {
            const r = v?.toPoint.subtract(v.fromPoint).add(this.options.offset).rotate((-this.hand.rotation), [0, 0]);
            const rotate = (this.diffConfigs.length - 1) * this.options.rotate / -2 + i * this.options.rotate;

            v.card.position = v.card.position.add(r?.multiply(diff));
            v.card.rotate((this.discardPile.rotation + rotate) * diff);
        });

        this.diffReserveVectorConfigs.forEach((v) => {
            const r = v?.toPoint.subtract(v.fromPoint);

            v.card.position = v.card.position.add(r?.rotate(-this.hand.rotation, [0, 0])?.multiply(diff));
        });

        this.currentStep += 1;

        if (this.currentStep == this.steps.length - 1) {
            const tempRotation = this.discardPile.rotation;
            this.discardPile.rotate(-tempRotation);
            const rect = this.discardPile.bounds;
            this.discardPile.rotate(tempRotation);

            this.diffConfigs.forEach((c) => {
                c.card.rotate(this.hand.rotation - this.discardPile.rotation);
                c.card.position = this.discardPile.globalToLocal(c.toPoint).add(this.options.offset);
                this.hand.cards.splice(this.hand.cards.findIndex((v) => v == c.card), 1);
                this.discardPile.cards.push(c.card);
                
                this.discardPile.addChild(c.card);
            });

            this.onAnimated?.();
        }
    }

    private calcSteps = () => {
        const steps = Math.round((this.options?.time ?? 1) * 1000 / 16.66);
        const diffSteps = steps - (this.currentStep ?? 0);

        this.steps = [];
        this.currentStep = 0;

        for (let i = 0; i <= diffSteps; i++) {            
            let progress = i / diffSteps;
            let easedProgress = Power2.easeInOut(progress);
            this.steps.push(easedProgress);
        }
    }

    private calcDiffVector = () => {
        this.diffConfigs = [];
        this.diffReserveVectorConfigs = [];

        this.cards.forEach((v, i) => {
            const handRotation = this.discardPile.rotation;
            this.discardPile.rotate(-handRotation);
            const discardPlieRect = this.discardPile.bounds;
            this.discardPile.rotate(handRotation);

            const config = {
                card: v,
                fromPoint: this.hand.localToGlobal(v.bounds.center),
                toPoint: this.discardPile.localToGlobal(discardPlieRect.center.subtract(discardPlieRect.point)),
            };

            this.diffConfigs.push(config);
        });

        const reserveFromCards = this.hand.cards?.filter((v) => !this.cards.includes(v));
        reserveFromCards?.forEach((v, i) => {
            const handRotation = this.hand.rotation;
            this.hand.rotate(-handRotation);
            const handRect = this.hand.bounds;
            this.hand.rotate(handRotation);

            const config = {
                card: v,
                fromPoint: this.hand.localToGlobal(v.bounds.center),
                toPoint: i == 0 ? this.hand.localToGlobal(handRect.center.subtract(handRect.point)) : this.diffReserveVectorConfigs[i - 1].toPoint.add(new Point([15, 0]).rotate(this.hand.rotation, [0, 0])),
            };

            this.diffReserveVectorConfigs.forEach((v) => {
                v.toPoint = v.toPoint.add(new Point([-15, 0]).rotate(this.hand.rotation, [0, 0]));
            });

            this.diffReserveVectorConfigs.push(config);
        });
    }
}

interface DiffConfig {
    card: Card,
    fromPoint: paper.Point,
    toPoint: paper.Point,
}

interface DrawingOptions {
    time: number,
}

interface PlayingOptions {
    time: number,
    rotate: number,
    offset: number,
}