'use strict';
class ArraySplitByCondition {
    constructor() {
        this.type = 'Array Split by Condition';
        this.description = 'Découpe un tableau en sous-tableaux basés sur une condition de filtre. Chaque fois qu\'un élément correspond à la condition, un nouveau sous-tableau est créé avec cet élément.';
        this.editor = 'array-split-by-condition-editor';
        this.graphIcon = 'default.svg';
        this.tags = [
            'http://semantic-bus.org/data/tags/middleComponents',
            'http://semantic-bus.org/data/tags/middleQueryingComponents'
        ];
    }
}

module.exports = new ArraySplitByCondition();

