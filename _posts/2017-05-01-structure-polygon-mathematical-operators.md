---
title: C++ Structure Polygon Mathematical Operators
author: Razzk
date: '2017-05-01 14:10:00 +0800'
categories:
  - Projects 
  - C++
tags:
  - C++
  - Math
published: true
comments: true
math: true
pin: true
---

## Inroduction

> Structure Polygons shaps calculators writen in c++ can do multiple operation on multiple polygon given by points on one string . 

## Project Description

a program to do operations on polygons data. The program use a defined string format to represent polygons. All polygons will be in one line input. For example:
`Polygons=[(1,1),(4,1),(4,5),(1,5);(3,4),(6,4),(6,12),(3,12)]`

## Polygons Data

The Polygons line contains a list of polygons data separated by ‘;’. Fields of a Polygon is represented by a set of points separated by ‘,’. The number of polygons are up to 1000 polygon. Each polygon has up to 100 points.
 
### Definition of Redundant Point

A redundant point is a point of the polygon points that can be deleted without change in the polygon shape. Like 

- Examples of Redundant Point 
  - (1,1),`(2,1)`,(4,1),(4,3),(1,3)
  - (1,2),(4,2),`(4,2)`,(4,8),(1,8)
  - (1,2),(4,2),`(4,2)`,`(4,2)`,(4,8),(1,8)

In the second case two neighbor identical points any one of them can be redundant (you should select only the second one). If more than two points are identical and follow each other, all of them are redundant except the first point of them.

### Intersecting Polygons

Intersecting Polygons are polygons sharing common area, side, or point(s).

### Connected Polygons

Two Connected Polygons are polygons that are intersecting or polygons which have path from one to the other through intersecting polygons.

## Operations

When the program start, the user enters one Polygons Line in the defined above format then followed by one or more operations from the below table (each operation in a line). The program ends when it reads Quit operation.

### Operations Table 

|           Operation          |                                      Action                                                |
|:-----------------------------|:-------------------------------------------------------------------------------------------|
| Number_Polygons              | Print the number of polygons.                                                              |
| Total_Number_Points          | Print the total number of points in all polygons.                                          |
| Minimum_X                    | Print the minimum X value of all points.                                                   |
| Maximum_X                    | Print the maximum X value of all points                                                    |
| Minimum_Y                    | Print the minimum Y value of all points.                                                   |
| Maximum_Y                    | Print the maximum Y value of all points                                                    |
| Enclosing_Rectangle          | Print the minimum Enclosing Rectangle that includes all polygons inside it                 |
| Total_Redundant_Points       | The number of Redundant points in all polygons                                             |
| Polygon_Points `n`           | List all points of the nth polygon (neglecting redundant points) n start from 1            |
| Point_Polygons `(2,1)`       | List all polygons IDs(ID is 1 for the first polygon, 2 for the second polygon,...)         |
| List_Polygons_Points More `n`| List Polygons having more than n points excluding redundant points where n is an integer.  |
| List_Polygons_Points Less `n`| List Polygons having less than n points excluding redundant points where n is an integer.  |
| List_Polygons_Points Equal`n`| List Polygons having exactly n points excluding redundant points where n is an integer.    |
| List_Points_Polygons More `n`| List all Points that are in the list of more than n polygons where n is an integer.        |
| List_Points_Polygons Less `n`| List all Points that are in the list of less than n polygons where n is an integer.        |
| List_Points_Polygons Equal`n`| List all Points that are in the list of less than n polygons where n is an integer.        |
| Polygon_Perimeter `n`        | Print the perimeter of the nth polygon.                                                    |
| List_Triangles               | List all Polygon IDs of polygons that are triangles.                                       |
| List_Rectangles              | List all Polygon IDs of polygons that are rectangles.                                      |
| List_Trapezoid               | List all Polygon IDs of polygons that are trapezoid.                                       |
| Inside_Rectangle`Edge Points`| List all Polygon IDs of polygons that are inside the given rectangle.                      | 
| Inside_Circle  e.g`(1,2),5`  | List all Polygon IDs of polygons that are inside the given Circle `Center` `Raduis`        |
| Polygon_Area `n`             | Print the polygon area of the nth polygon                                                  |
| Polygons_Area_Range `n1`,`n2`| List all Polygon IDs of polygons that have area <= minArea`n1` and >=maxArea.`n1`          |  
| Polygons_Enclosing_Point `p` | List all Polygon IDs of polygons that have the point `p` (1,2) inside it                   |  
| Is_Intersecting i,j          | Print TRUE if ith polygon intersects the jth polygon                                       |
| Intersecting_Group 3,5,6     | Print TRUE if the list of polygon are all intersecting with each other                     |
| Largest_Intersecting_Pair    | Print the two IDs of polygons that are intersecting and having the largest sum of area.    |
| Largest_Rectangle_Inside `n` | Print the largest rectangle that can inside the nth polygon.                               |
| Largest_Circle_Inside `n`    | Print the largest circle that can inside the nth polygon.                                  |



## Code - Some Funcations 

```ruby
int Number_Polygons (string input , int input_length) //function to get polygons number
{
    int polygon_numbers = 0 ;

    for (int i=0 ; i <= input_length ; i++ )
    {
        if ( input [i]== ';')
        {
            polygon_numbers = polygon_numbers +1 ;
        }
    }
    return  polygon_numbers+1 ;
}
```


```ruby
int Total_Number_Points (string input , int input_length) //function to get total number of points
{
    int number_point = 0 ;
    for (int i = 0 ; i <= input_length  ; i++ )
    {
        if (input[i]=='(')
        {
            number_point = number_point  + 1 ;
        }
    }
    return  number_point ;
}
```

```ruby
int Total_Number_Points (string input , int input_length) //function to get total number of points
{
    int Redundant_points (string points , int number ) // function to number of redundant at polygon
{
    int arc[1000]; int col[1000];int inarc[1000];int   counter1= 0;int  counter2= 0 ;int counter3 = 0 ;int colrep = 1  ;

    for (int i =0 ;  i<= points.length() ;i++ ) //getting place of that "(" and  ")" and ","
    {
        if (points[i]== '('){counter1=counter1+1;  arc[counter1]=i ;}
        if (points[i]== ','){counter2=counter2+1;  col[counter2]=i ;}
        if (points[i]== ')'){counter3=counter3+1;inarc[counter3]=i ;}
    }
    float x[1000]; float y [1000]; float slope[1000];
    for (int i = 1 ; i <=number ; i++){

        x[i]=atof(points.substr(arc[i]+1,col[colrep]-arc[i]-1).c_str()) ;
        y[i]=atof(points.substr(col[colrep]+1,inarc[i]-col[colrep]-1).c_str())  ;
        colrep +=2 ;
    }

    float xr[1000]; float yr[1000];
    xr[1]=x[1]; yr[1]=y[1];
    //  int repeater = 2 ;
    int re =0;

    slope[1]=((y[1+1]-y[1])/(x[1+1]-x[1]));
    for (int i = 2 ; i<=number ; i++)
    {
        slope[i]=((y[i+1]-y[i])/(x[i+1]-x[i]));

        for (int p =2 ; p <=number ;p++){

            if (x[i-1]==x[i] && y[i-1]==y[i]) { re +=1 ; break; } // get redundant of dip point
            if(x[i+1]-x[i] !=0 && slope[i]==slope[i-1]) { re +=1 ;break; } // getting redundant point of slope
            if (x[i+1]-x[i]==0 && y[i+1]-y[i]!=0 && x[i]-x[i-1]==0 && y[i]-y[i-1]!=0 ){  re+=1;   ; break; }// get redundant of x-x =0

            // xr[repeater] = x[i];yr[repeater] =y[i];repeater +=1 ;
            break ;
        }}
    //for (int i=1 ;i<repeater ; i++) { cout << "X = " << xr[i] << endl;cout << "y = " << yr[i] << endl; }
    return re ;
}}
```


## Learn More

 For Project Code , Visit  [Project Repository ](https://github.com/MohamedRazzk/structure_polygon_mathematical_operators/).
