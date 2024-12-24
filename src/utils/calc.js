export class DNASequenceMatcher {
    constructor(sequence) {
        this.sequence = sequence.toUpperCase();
        this.degenerateMap = {
            'A': ['A'],
            'T': ['T'],
            'C': ['C'],
            'G': ['G'],
            'N': ['A', 'T', 'C', 'G'],
            'R': ['A', 'G'],
            'Y': ['C', 'T'],
            'M': ['A', 'C'],
            'K': ['G', 'T'],
            'S': ['C', 'G'],
            'W': ['A', 'T'],
            'H': ['A', 'C', 'T'],
            'B': ['C', 'G', 'T'],
            'V': ['A', 'C', 'G'],
            'D': ['A', 'G', 'T']
        };
    }

    /**
     * 流式搜索生成器
     * @generator
     */
    *searchStream(target, options = {}) {
        const {
            minMatchRate = 0.9,
            useDegenerate = false,
            startPos = 0,
            endPos = this.sequence.length,
            batchSize = 1000
        } = options;

        target = target.toUpperCase();
        
        // 参数验证
        if (!target || minMatchRate < 0 || minMatchRate > 1) {
            throw new Error('无效的参数');
        }

        const targetLength = target.length;
        let currentBatch = [];
        
        // 流式处理每个位置
        for (let pos = startPos; pos <= endPos - targetLength; pos++) {
            const segment = this.sequence.slice(pos, pos + targetLength);
            if (this.checkSegmentMatch(segment, target, minMatchRate, useDegenerate)) {
                const match = {
                    position: pos,
                    sequence: segment,
                    matchRate: this.calculateMatchRate(segment, target, useDegenerate)
                };
                
                currentBatch.push(match);
                
                // 当批次达到指定大小时，yield 当前批次
                if (currentBatch.length >= batchSize) {
                    yield currentBatch;
                    currentBatch = [];
                }
            }
        }
        
        // 返回最后一个不完整的批次
        if (currentBatch.length > 0) {
            yield currentBatch;
        }
    }

    isMatch(a, b, useDegenerate) {
        return useDegenerate ? this.degenerateMap[a]?.includes(b) : a === b;
    }

    /**
     * 检查序列片段是否匹配
     * @private
     */
    checkSegmentMatch(segment, pattern, minMatchRate, useDegenerate) {
        let matches = 0;
        const length = pattern.length;
        
        for (let i = 0; i < length; i++) {
            const patternBase = pattern[i];
            const segmentBase = segment[i];
            
            const patternMatches = useDegenerate ? this.degenerateMap[patternBase] || [patternBase] : [patternBase];
            const segmentMatches = useDegenerate ? this.degenerateMap[segmentBase] || [segmentBase] : [segmentBase];
            
            if (patternMatches.some(p => segmentMatches.includes(p))) {
                matches++;
            }
        }
        
        return matches / length >= minMatchRate;
    }

    /**
     * 计算匹配率
     * @private
     */
    calculateMatchRate(seq1, seq2, useDegenerate) {
        let matches = 0;
        const length = seq1.length;
        
        for (let i = 0; i < length; i++) {
            const base1 = seq1[i];
            const base2 = seq2[i];
            
            const matches1 = this.isMatch(base1, base2, useDegenerate);
            const matches2 = this.isMatch(base2, base1, useDegenerate);
            
            if (matches1.some(b1 => matches2.includes(b1))) {
                matches++;
            }
        }
        
        return matches / length;
    }

    /**
     * 常规搜索方法（返回所有结果）
     */
    search(target, options = {}) {
        const results = [];
        for (const batch of this.searchStream(target, options)) {
            results.push(...batch);
        }
        return results;
    }
}

// 使用示例
async function searchDNA() {
    try {
        const sequence = "ATCGNATCGATCGATATCG".repeat(25000); // 大序列，约500,000个碱基
        const target = "ATCGN";
        const matcher = new DNASequenceMatcher(sequence);

        console.time('DNA搜索');
        
        // 使用流式处理
        let matchCount = 0;
        for (const batch of matcher.searchStream(target, { batchSize: 100 })) {
            matchCount += batch.length;
            // 处理每个批次的结果
            console.log(`处理批次，包含 ${batch.length} 个匹配`);
            
            // 这里可以添加其他处理逻辑
            // 例如：将结果写入文件、发送到服务器等
        }
        
        console.timeEnd('DNA搜索');
        console.log(`总共找到 ${matchCount} 个匹配`);
        
        return matchCount;
    } catch (error) {
        console.error('搜索出错:', error);
        return 0;
    }
}

// 使用 async/await 处理流
async function processStreamWithDelay() {
    const sequence = "ATCGNATCGATCGATATCG".repeat(25000); // 大序列，约500,000个碱基
    const matcher = new DNASequenceMatcher(sequence);
    
    for await (const batch of matcher.searchStream("ATCGN", { batchSize: 100 })) {
        // 模拟异步处理每个批次
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`处理批次：${batch.length} 个结果`);
    }
}