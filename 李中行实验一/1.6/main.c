#include<stdio.h>
int main()
{int a,b,c, max;
    printf("请输入三个整数，用空格隔开: ");
    scanf("%d %d %d", &a, &b, &c);
    max=a;
    if(b>max){
        max=b;
    }
    if (c > max){
        max=c;
    }
    printf("最大的数是: %d\n",max);
    return 0;


}