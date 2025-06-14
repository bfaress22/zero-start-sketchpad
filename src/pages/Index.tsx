
import React, { useState, useEffect, useCallback } from 'react';
import TradingViewWidget, { Themes, BarStyles } from 'react-tradingview-widget';
import { useTradingViewData, ForexPair } from '@/hooks/useTradingViewData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/ui/theme-toggle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ZeroCostTab from '@/components/ZeroCostTab';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface StrategyComponent {
  id?: string;
  type: 'call' | 'put' | 'forward' | 'spot' | 'put-knockout';
  strike: number;
  strikeType: 'percent' | 'absolute';
  premium?: number;
  quantity: number;
  expiry?: string;
  volatility?: number;
  barrier?: number;
  barrierType?: 'percent' | 'absolute';
  // Add support for dynamic strike calculation
  dynamicStrike?: {
    method: 'equilibrium';
    balanceWith: string; // Add this missing property
    balanceWithIndex: number;
    volatilityAdjustment?: number;
  };
}

const Index = () => {
  const { forexData, isLoading, error, refreshData, getSymbolData } = useTradingViewData();
  const [spotPrice, setSpotPrice] = useState<number>(0);
  const [selectedPair, setSelectedPair] = useState<string>('EURUSD');
  const [strategy, setStrategy] = useState<StrategyComponent[]>([]);
  const [payoff, setPayoff] = useState<number[]>([]);
  const [monthsToHedge, setMonthsToHedge] = useState<number>(12);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [showPayoffTable, setShowPayoffTable] = useState<boolean>(false);
  const [payoffTableType, setPayoffTableType] = useState<'absolute' | 'relative'>('absolute');
  const [payoffSimulationRange, setPayoffSimulationRange] = useState<[number, number]>([80, 120]);

  // Function to calculate the payoff of the strategy
  const calculatePayoff = useCallback(() => {
    if (!spotPrice || !strategy || strategy.length === 0) {
      setPayoff([]);
      return;
    }

    const [minRange, maxRange] = payoffSimulationRange;
    const numberOfPoints = 100;
    const step = (maxRange - minRange) / numberOfPoints;
    const spotPrices = Array.from({ length: numberOfPoints + 1 }, (_, i) => minRange + i * step);

    const calculatedPayoff = spotPrices.map(simulatedSpotPrice => {
      return strategy.reduce((totalPayoff, component) => {
        let optionPayoff = 0;

        switch (component.type) {
          case 'call':
            optionPayoff = Math.max(0, simulatedSpotPrice * (component.strikeType === 'percent' ? spotPrice * component.strike / 100 : component.strike) - (component.strikeType === 'percent' ? spotPrice * component.strike / 100 : component.strike)) * component.quantity;
            break;
          case 'put':
            optionPayoff = Math.max(0, (component.strikeType === 'percent' ? spotPrice * component.strike / 100 : component.strike) - simulatedSpotPrice * (component.strikeType === 'percent' ? spotPrice * component.strike / 100 : component.strike)) * component.quantity;
            break;
          case 'forward':
            optionPayoff = (spotPrice - simulatedSpotPrice) * component.quantity;
            break;
          case 'spot':
            optionPayoff = (simulatedSpotPrice - spotPrice) * component.quantity;
            break;
          case 'put-knockout':
            if (simulatedSpotPrice * (component.barrierType === 'percent' ? spotPrice * component.barrier! / 100 : component.barrier!) >= (component.barrierType === 'percent' ? spotPrice * component.barrier! / 100 : component.barrier!)) {
              optionPayoff = 0; // Knocked out
            } else {
              optionPayoff = Math.max(0, (component.strikeType === 'percent' ? spotPrice * component.strike / 100 : component.strike) - simulatedSpotPrice * (component.strikeType === 'percent' ? spotPrice * component.strike / 100 : component.strike)) * component.quantity;
            }
            break;
          default:
            break;
        }

        return totalPayoff + optionPayoff;
      }, 0);
    });

    setPayoff(calculatedPayoff);
  }, [spotPrice, strategy, payoffSimulationRange]);

  // Update spot price when selected pair changes or data is refreshed
  useEffect(() => {
    const pairData = getSymbolData(selectedPair);
    if (pairData) {
      setSpotPrice(pairData.price);
    }
  }, [selectedPair, forexData, getSymbolData]);

  // Recalculate payoff when strategy changes
  useEffect(() => {
    calculatePayoff();
  }, [strategy, calculatePayoff]);

  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
  };

  const handleMonthsChange = (months: number) => {
    setMonthsToHedge(months);
  };

  const toggleSimulator = () => {
    setShowSimulator(!showSimulator);
  };

  const togglePayoffTable = () => {
    setShowPayoffTable(!showPayoffTable);
  };

  const handlePayoffRangeChange = (value: number[]) => {
    setPayoffSimulationRange([value[0], value[1]]);
  };

  return (
    <div className="container mx-auto p-4">

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">FX Hedging Simulator</h1>
        <ModeToggle />
      </div>

      <Card className="shadow-md mb-4">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-xl font-bold text-primary">Market Data</CardTitle>
          <CardDescription>
            Real-time foreign exchange rates from TradingView
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading data...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency-pair">Select Currency Pair</Label>
              <Select value={selectedPair} onValueChange={handlePairChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a pair" />
                </SelectTrigger>
                <SelectContent>
                  {forexData.map((pair) => (
                    <SelectItem key={pair.symbol} value={pair.symbol}>{pair.symbol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Current Spot Price</Label>
              <Input type="text" value={spotPrice?.toFixed(4) || 'Loading...'} readOnly />
            </div>
            <div>
              <Label htmlFor="months-to-hedge">Months to Hedge</Label>
              <Input
                id="months-to-hedge"
                type="number"
                value={monthsToHedge}
                onChange={(e) => handleMonthsChange(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Selected Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button onClick={refreshData} className="mt-4">Refresh Data</Button>
        </CardContent>
      </Card>

      <Card className="shadow-md mb-4">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-xl font-bold text-primary">TradingView Chart</CardTitle>
          <CardDescription>
            Interactive chart for {selectedPair}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TradingViewWidget
            symbol={selectedPair}
            theme={Themes.DARK}
            locale="en"
            interval="D"
            style={BarStyles.BARS}
            width="100%"
            height={400}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="zero-cost" className="w-full mb-4">
        <TabsList>
          <TabsTrigger value="zero-cost">Zero-Cost Strategies</TabsTrigger>
          <TabsTrigger value="custom">Custom Strategy</TabsTrigger>
        </TabsList>
        <TabsContent value="zero-cost">
          <ZeroCostTab
            spotPrice={spotPrice}
            monthsToHedge={monthsToHedge}
            setStrategy={setStrategy}
            calculatePayoff={calculatePayoff}
          />
        </TabsContent>
        <TabsContent value="custom">
          <Card className="shadow-md">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-xl font-bold text-primary">Custom Strategy (Under Development)</CardTitle>
              <CardDescription>
                Build your own FX hedging strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p>This tab is under development. Please check back later!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="shadow-md mb-4">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold text-primary">Payoff Simulation</CardTitle>
              <CardDescription>
                Simulate the payoff of your hedging strategy
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={togglePayoffTable}>
              {showPayoffTable ? "Hide Table" : "Show Table"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label>Simulation Range: {payoffSimulationRange[0]} - {payoffSimulationRange[1]}</Label>
            <Slider
              defaultValue={payoffSimulationRange}
              min={Math.max(0, spotPrice - 50)}
              max={spotPrice + 50}
              step={1}
              onValueChange={handlePayoffRangeChange}
            />
          </div>
          {payoff.length > 0 ? (
            <div className="relative w-full h-64">
              {/* Placeholder for the chart */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Payoff chart will be displayed here
              </div>
            </div>
          ) : (
            <p>No payoff data to display. Please add a strategy.</p>
          )}
        </CardContent>
      </Card>

      {showPayoffTable && (
        <Card className="shadow-md mb-4">
          <CardHeader className="pb-2 border-b">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-xl font-bold text-primary">Payoff Table</CardTitle>
              <Select value={payoffTableType} onValueChange={(value) => setPayoffTableType(value as 'absolute' | 'relative')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="absolute">Absolute</SelectItem>
                  <SelectItem value="relative">Relative to Spot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Detailed payoff values for different spot prices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Payoff values for different spot prices</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Spot Price</TableHead>
                  <TableHead>Payoff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoff.length > 0 && Array.from({ length: 101 }, (_, i) => {
                  const simulatedSpotPrice = payoffSimulationRange[0] + i * ((payoffSimulationRange[1] - payoffSimulationRange[0]) / 100);
                  const payoffValue = payoff[i];
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{simulatedSpotPrice.toFixed(2)}</TableCell>
                      <TableCell>{payoffValue.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          &copy; 2024 FX Hedging Simulator. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Index;
