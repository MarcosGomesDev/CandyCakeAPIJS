const sumOfArray = function (arr) {
    const initialValue = 0;
    
    const totalSum = arr.reduce((previousValue, currentValue) => 
    previousValue + currentValue, initialValue);
    
    return totalSum
}

const averageOfArray = function (arr) {
    return ((sumOfArray(arr)) / arr.length)
}


module.exports = {sumOfArray, averageOfArray}