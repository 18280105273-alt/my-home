#include <stdio.h>
#define PRICE 45

int main()
{
    float f, c;
    printf("请输入华氏度：");
    scanf("%f", &f);
    c = 5.0 / 9 * (f - 32);
    printf("c=%f\n", c);
    
    return 0;
}